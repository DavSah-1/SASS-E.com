import { ENV } from "./env";

/**
 * Web search integration using Tavily API
 * Provides real-time web search capabilities for Assistant Bob
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
 * Search the web for information
 * @param query - The search query
 * @param maxResults - Maximum number of results to return (default: 5)
 * @returns Search results with titles, URLs, and content snippets
 */
export async function searchWeb(
  query: string,
  maxResults: number = 5
): Promise<TavilySearchResponse> {
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: query,
        max_results: maxResults,
        search_depth: "advanced",
        include_answer: true,
        include_raw_content: false,
        days: 30, // Prioritize recent results from last 30 days
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      query: query,
      results: data.results || [],
    };
  } catch (error) {
    console.error("Web search error:", error);
    return {
      query: query,
      results: [],
    };
  }
}

/**
 * Format search results into a context string for the LLM
 * @param results - Search results from Tavily
 * @returns Formatted string with search results
 */
export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return "No search results found.";
  }

  return results
    .map((result, index) => {
      return `[${index + 1}] ${result.title}\n${result.content}\nSource: ${result.url}`;
    })
    .join("\n\n");
}

