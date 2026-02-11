'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { validateProfileInput } from '@/app/lib/validation/profile'

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
  const validated = validateProfileInput(formData, { requireCityZone: true })
  if (!validated.ok) {
    return { error: validated.error }
  }
  const { display_name, city, zone, avatar_url } = validated.data

  const supabase = createServerSupabaseClient()

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (!session || sessionError) {
    return { error: 'No autorizado. Por favor inicia sesión.' }
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: session.user.id,
        display_name,
        city,
        zone,
        avatar_url,
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

  // Si OK => redirect a /onboarding/step-2
  redirect('/onboarding/step-2')
}

