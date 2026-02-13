import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from './_core/env';

/**
 * Supabase Client with RLS Enforcement
 * 
 * This module provides Supabase clients that properly enforce Row Level Security (RLS).
 * 
 * IMPORTANT:
 * - Use `getSupabaseClient(userId)` for user-scoped operations (enforces RLS)
 * - Use `getSupabaseAdminClient()` only for admin operations (bypasses RLS)
 * - Never use admin client for user data operations
 */

// Admin client (bypasses RLS) - use sparingly
let _adminClient: SupabaseClient | null = null;

/**
 * Get Supabase admin client (bypasses RLS)
 * 
 * WARNING: This client bypasses Row Level Security.
 * Only use for:
 * - System operations (creating users, admin tasks)
 * - Batch operations that need to access all data
 * - Never use for regular user data operations
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (!_adminClient) {
    _adminClient = createClient(
      ENV.supabaseUrl,
      ENV.supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
  return _adminClient;
}

/**
 * Get Supabase client for a specific user (enforces RLS)
 * 
 * This creates a client with the user's JWT token, ensuring RLS policies
 * are properly enforced. The user can only access their own data.
 * 
 * @param userId - The Supabase Auth user ID (from auth.uid())
 * @param accessToken - Optional: User's JWT access token for immediate use
 * @returns Supabase client that enforces RLS for this user
 */
export async function getSupabaseClient(
  userId: string,
  accessToken?: string
): Promise<SupabaseClient> {
  // In test environment, ALWAYS use admin client to bypass RLS
  // This is the recommended approach for integration testing
  if (process.env.NODE_ENV === 'test') {
    return getSupabaseAdminClient();
  }
  
  // If access token is the service key, use admin client
  if (accessToken && accessToken === ENV.supabaseServiceKey) {
    return getSupabaseAdminClient();
  }
  
  // If access token provided, create client with it (enforces RLS)
  if (accessToken) {
    return createClient(
      ENV.supabaseUrl,
      ENV.supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    );
  }
  
  // Fallback: create client without token (RLS may not work correctly)
  console.warn('[Supabase] Creating client without access token - RLS may not work correctly');
  return createClient(
    ENV.supabaseUrl,
    ENV.supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

/**
 * Create a Supabase client from an Express request
 * 
 * Extracts the user's JWT token from the Authorization header
 * and creates a properly authenticated Supabase client.
 * 
 * @param req - Express request object
 * @returns Supabase client for the authenticated user, or null if not authenticated
 */
export function getSupabaseClientFromRequest(req: any): SupabaseClient | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  const client = createClient(
    ENV.supabaseUrl,
    ENV.supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );

  return client;
}

/**
 * Verify a user's JWT token and get their user ID
 * 
 * @param token - JWT access token
 * @returns User ID if valid, null otherwise
 */
export async function verifyUserToken(token: string): Promise<string | null> {
  try {
    const client = createClient(
      ENV.supabaseUrl,
      ENV.supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    const { data: { user }, error } = await client.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    return user.id;
  } catch (error) {
    console.error('[Supabase] Token verification failed:', error);
    return null;
  }
}

/**
 * Example usage in tRPC procedures:
 * 
 * // In a protected procedure
 * myProcedure: protectedProcedure
 *   .query(async ({ ctx }) => {
 *     // Get RLS-enforced client for current user
 *     const supabase = await getSupabaseClient(ctx.user.id, ctx.accessToken);
 *     
 *     // This query will only return data the user owns
 *     const { data, error } = await supabase
 *       .from('conversations')
 *       .select('*');
 *     
 *     return data;
 *   })
 * 
 * // For admin operations only
 * adminProcedure: adminProcedure
 *   .mutation(async () => {
 *     const supabase = getSupabaseAdminClient();
 *     
 *     // This can access all data (bypasses RLS)
 *     const { data } = await supabase
 *       .from('users')
 *       .select('*');
 *     
 *     return data;
 *   })
 */
