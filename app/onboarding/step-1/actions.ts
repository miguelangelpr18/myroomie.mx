'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export interface ProfileData {
  display_name: string
  city: string
  zone: string
  avatar_url: string | null
}

export async function getMyProfile() {
  const supabase = createServerSupabaseClient()

  // Verificar sesión
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (!session || sessionError) {
    redirect('/login')
  }

  // Buscar perfil del usuario
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    // Error diferente a "no encontrado"
    return { data: null, error: error.message }
  }

  return { data: data || null, error: null }
}

export async function saveMyProfile(formData: ProfileData) {
  const supabase = createServerSupabaseClient()

  // Verificar sesión
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (!session || sessionError) {
    return { error: 'No autorizado. Por favor inicia sesión.' }
  }

  // Validaciones server-side
  const { display_name, city, zone, avatar_url } = formData

  if (!display_name || display_name.trim().length < 2 || display_name.trim().length > 40) {
    return { error: 'Display name debe tener entre 2 y 40 caracteres' }
  }

  if (!city || city.trim().length < 2 || city.trim().length > 60) {
    return { error: 'City debe tener entre 2 y 60 caracteres' }
  }

  if (!zone || zone.trim().length < 2 || zone.trim().length > 80) {
    return { error: 'Zone debe tener entre 2 y 80 caracteres' }
  }

  // Upsert perfil
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: session.user.id,
        display_name: display_name.trim(),
        city: city.trim(),
        zone: zone.trim(),
        avatar_url: avatar_url?.trim() || null,
      },
      {
        onConflict: 'user_id',
      }
    )
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data, error: null }
}

