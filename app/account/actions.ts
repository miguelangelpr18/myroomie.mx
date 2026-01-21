'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface AccountProfileData {
  display_name: string
  avatar_url: string | null
}

export async function updateProfile(formData: AccountProfileData) {
  const supabase = createServerSupabaseClient()

  // Verificar sesión
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (!session || sessionError) {
    return { error: 'No autorizado. Por favor inicia sesión.' }
  }

  // Validaciones server-side
  const { display_name, avatar_url } = formData

  if (!display_name || display_name.trim().length < 2 || display_name.trim().length > 40) {
    return { error: 'Display name debe tener entre 2 y 40 caracteres' }
  }

  // Update perfil (solo display_name y avatar_url)
  const { data, error } = await supabase
    .from('profiles')
    .update({
      display_name: display_name.trim(),
      avatar_url: avatar_url?.trim() || null,
    })
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Revalidar paths para actualizar UI
  revalidatePath('/account')
  revalidatePath('/dashboard')
  // Revalidar header (layout)
  revalidatePath('/', 'layout')

  return { data, error: null }
}


