'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface EditProfileData {
  display_name: string
  city: string
  zone: string
  bio?: string
  location_id?: string | null
  avatar_url?: string | null
}

export async function updateProfile(data: EditProfileData) {
  if (!data.display_name?.trim() || data.display_name.trim().length < 2) {
    return { error: 'El nombre debe tener al menos 2 caracteres.' }
  }
  if (!data.city?.trim()) {
    return { error: 'La ciudad es requerida.' }
  }

  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const payload: Record<string, unknown> = {
    display_name: data.display_name.trim(),
    city: data.city.trim(),
    zone: data.zone?.trim() || '',
    bio: data.bio?.trim() || null,
  }
  if (data.location_id) payload.location_id = data.location_id
  if (data.avatar_url !== undefined) payload.avatar_url = data.avatar_url

  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('user_id', user.id)

  if (error) {
    console.error('updateProfile failed:', error)
    return { error: 'Error al actualizar perfil. Intenta de nuevo.' }
  }

  revalidatePath(`/profiles/${user.id}`)
  revalidatePath('/dashboard')
  revalidatePath('/account')
  return { error: null }
}
