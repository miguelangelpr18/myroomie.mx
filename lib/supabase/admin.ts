import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Admin client that bypasses RLS. Use ONLY for operations that genuinely
 * need admin privileges (e.g., upsert with onConflict on shared tables).
 *
 * NEVER use this for simple SELECT queries — use createServerSupabaseClient() instead.
 * NEVER import this in client components.
 */
export function createAdminSupabaseClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
