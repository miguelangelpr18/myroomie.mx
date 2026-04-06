'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { validateProfileInput } from '@/app/lib/validation/profile'

export interface AccountProfileData {
  display_name: string
  avatar_url: string | null
}

export async function updateProfile(formData: AccountProfileData) {
  const validated = validateProfileInput(formData, { requireCityZone: false })
  if (!validated.ok) {
    return { error: validated.error }
  }
  const { display_name, avatar_url } = validated.data

  const supabase = createServerSupabaseClient()

  const { data: { user }, error: sessionError } = await supabase.auth.getUser()
  if (!user || sessionError) {
    return { error: 'No autorizado. Por favor inicia sesión.' }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      display_name,
      avatar_url,
    })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('updateProfile (account) failed:', error)
    return { error: 'Error al actualizar perfil. Intenta de nuevo.' }
  }

  // Revalidar paths para actualizar UI
  revalidatePath('/account')
  revalidatePath('/dashboard')
  // Revalidar header (layout)
  revalidatePath('/', 'layout')

  return { data, error: null }
}



