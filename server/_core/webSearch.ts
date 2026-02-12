import { ENV } from "./env";
import { SearchError, QuotaExceededError, logError } from "../errors";

/**
 * Web search integration using Tavily API
 * Provides real-time web search capabilities for SASS-E
 * 
 * Features:
 * - Automatic timeout protection (10 seconds)
 * - Quota tracking and enforcement
 * - Graceful degradation on failures
 * - Retry logic for transient failures
 * - Comprehensive error handling
 */

interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

interface TavilySearchResponse {
  results: SearchResult[];
  query: string;
}

/**
 * Configuration constants
 */
const SEARCH_TIMEOUT_MS = 10000; // 10 seconds
const TAVILY_MONTHLY_QUOTA = 1000; // Free tier limit
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000; // 1 second base delay

/**
 * In-memory quota tracking
 * TODO: Replace with Redis or database for production multi-instance deployments
 */
const quotaTracker = new Map<string, number>();

/**
 * Check if we have remaining quota for Tavily API
 * @returns true if quota is available, false otherwise
 */
async function checkTavilyQuota(): Promise<boolean> {
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const key = `tavily_${month}`;
  
  const currentUsage = quotaTracker.get(key) || 0;
  
  if (currentUsage >= TAVILY_MONTHLY_QUOTA) {
    console.warn(`Tavily quota exceeded: ${currentUsage}/${TAVILY_MONTHLY_QUOTA} for ${month}`);
    return false;
  }
  
  return true;
}

/**
 * Increment the quota counter for Tavily API
 */
async function incrementTavilyQuota(): Promise<void> {
  const month = new Date().toISOString().slice(0, 7);
  const key = `tavily_${month}`;
  
  const currentUsage = quotaTracker.get(key) || 0;
  quotaTracker.set(key, currentUsage + 1);
  
  console.log(`Tavily usage: ${currentUsage + 1}/${TAVILY_MONTHLY_QUOTA} for ${month}`);
}

/**
 * Search the web for information with comprehensive error handling
 * 
 * @param query - The search query
 * @param maxResults - Maximum number of results to return (default: 3)
 * @param retryCount - Current retry attempt (used internally)
 * @returns Search results with titles, URLs, and content snippets, or null on failure
 * 
 * @throws {QuotaExceededError} When monthly quota is exceeded
 * @throws {SearchError} When search fails after all retries
 * 
 * Note: This function returns null for network/timeout errors to allow graceful degradation
 */
export async function searchWeb(
  query: string,
  maxResults: number = 3,
  retryCount: number = 0
): Promise<TavilySearchResponse | null> {
  try {
    // Validate input
    if (!query || query.trim().length === 0) {
      throw new SearchError('Search query cannot be empty');
    }
    
    if (query.length > 400) {
      throw new SearchError('Search query too long (max 400 characters)');
    }
    
    // Check API key
    if (!process.env.TAVILY_API_KEY) {
      console.error('TAVILY_API_KEY not configured');
      throw new SearchError('Search service not configured');
    }
    
    // Check quota before making request
    const hasQuota = await checkTavilyQuota();
    if (!hasQuota) {
      throw new QuotaExceededError('tavily');
    }
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);
    
    try {
      // Make API request
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query: query.trim(),
          max_results: Math.min(maxResults, 10), // Cap at 10 results
          search_depth: "advanced",
          include_answer: true,
          include_raw_content: false,
          days: 30, // Prioritize recent results from last 30 days
        }),
        signal: controller.signal,
      });
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      // Handle HTTP errors
      if (!response.ok) {
        // Check for rate limiting
        if (response.status === 429) {
          // If we haven't exceeded max retries, try again with exponential backoff
          if (retryCount < MAX_RETRIES) {
            const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
            const jitter = Math.random() * 500; // Add 0-500ms jitter
            
            console.warn(`Tavily rate limited, retrying in ${delay + jitter}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            
            await sleep(delay + jitter);
            return searchWeb(query, maxResults, retryCount + 1);
          }
          
          throw new QuotaExceededError('tavily');
        }
        
        // Handle other HTTP errors
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new SearchError(`Tavily API returned ${response.status}: ${errorText}`);
      }
      
      // Parse response
      const data = await response.json();
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new SearchError('Invalid response from Tavily API');
      }
      
      // Increment quota counter after successful request
      await incrementTavilyQuota();
      
      // Return results (empty array if no results)
      return {
        query: query.trim(),
        results: Array.isArray(data.results) ? data.results : [],
      };
      
    } finally {
      // Always clear timeout
      clearTimeout(timeoutId);
    }
    
  } catch (error) {
    // Re-throw known error types
    if (error instanceof QuotaExceededError || error instanceof SearchError) {
      logError(error, 'searchWeb');
      throw error;
    }
    
    // Handle abort/timeout errors - return null for graceful degradation
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Search request timed out after ${SEARCH_TIMEOUT_MS}ms, continuing without search');
      return null;
    }
    
    // Handle network errors - return null for graceful degradation
    if (error instanceof TypeError) {
      console.warn('Network error during search, continuing without search:', error.message);
      return null;
    }
    
    // Log unexpected errors
    logError(error, 'searchWeb');
    
    // Throw SearchError for unexpected errors
    throw new SearchError('Failed to perform web search');
  }
}

/**
 * Format search results into a context string for the LLM
 * 
 * @param results - Search results from Tavily
 * @returns Formatted string with search results
 */
export function formatSearchResults(results: SearchResult[]): string {
  if (!results || results.length === 0) {
    return "No search results found.";
  }
  
  return results
    .map((result, index) => {
      // Validate result structure
      const title = result.title || 'Untitled';
      const content = result.content || 'No content available';
      const url = result.url || 'No URL';
      
      return `[${index + 1}] ${title}\n${content}\nSource: ${url}`;
    })
    .join("\n\n");
}

/**
 * Determine if a query should trigger a web search
 * Based on keyword detection for specific topics
 * 
 * @param message - The user's message
 * @returns true if search should be performed
 */
export function shouldPerformSearch(message: string): boolean {
  if (!message || message.trim().length === 0) {
    return false;
  }
  
  const lowerMessage = message.toLowerCase();
  
  // Keywords that trigger search
  const searchKeywords = [
    'weather',
    'news',
    'price',
    'cost',
    'latest',
    'current',
    'today',
    'recent',
    'stock',
    'cryptocurrency',
    'crypto',
  ];
  
  return searchKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Get current quota usage for monitoring
 * @returns Object with current usage and limit
 */
export function getQuotaStatus(): { used: number; limit: number; month: string } {
  const month = new Date().toISOString().slice(0, 7);
  const key = `tavily_${month}`;
  const used = quotaTracker.get(key) || 0;
  
  return {
    used,
    limit: TAVILY_MONTHLY_QUOTA,
    month,
  };
}

/**
 * Sleep helper for retry delays
 * @param ms - Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
