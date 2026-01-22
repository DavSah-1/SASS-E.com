import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key for backend operations
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[Supabase] Missing environment variables. Supabase auth will not work.')
}

export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

/**
 * Verify a user's JWT token and return user information
 * @param token - JWT token from Authorization header
 * @returns User object if valid, null otherwise
 */
export async function verifySupabaseToken(token: string) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized')
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      return null
    }
    
    return user
  } catch (error) {
    console.error('[Supabase] Error verifying token:', error)
    return null
  }
}

/**
 * Get user by ID (admin operation)
 * @param userId - Supabase user ID
 * @returns User object if found, null otherwise
 */
export async function getUserById(userId: string) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized')
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (error || !user) {
      return null
    }
    
    return user
  } catch (error) {
    console.error('[Supabase] Error getting user:', error)
    return null
  }
}
