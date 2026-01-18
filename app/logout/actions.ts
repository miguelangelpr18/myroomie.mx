'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Server Action para cerrar sesión
 * Borra las cookies SSR correctamente
 */
export async function logout() {
  const supabase = createServerSupabaseClient()

  // Cerrar sesión en el servidor (esto borra las cookies SSR)
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

