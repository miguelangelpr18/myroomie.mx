'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Verificar si el usuario tiene perfil
 * Retorna true si tiene perfil, false si no
 */
export async function hasProfile() {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return false
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  return !!profile
}



