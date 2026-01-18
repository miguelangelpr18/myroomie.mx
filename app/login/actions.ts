'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Verificar si el usuario tiene perfil
 * Retorna true si tiene perfil, false si no
 */
export async function hasProfile() {
  const supabase = createServerSupabaseClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return false
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  return !!profile
}

