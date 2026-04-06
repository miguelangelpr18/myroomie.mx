'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { validateProfileInput } from '@/app/lib/validation/profile'

export interface ProfileData {
  display_name: string
  city: string
  zone: string
  location_id?: string | null
  avatar_url: string | null
}

export async function getMyProfile() {
  const supabase = createServerSupabaseClient()

  // Verificar sesión
  const { data: { user }, error: sessionError } = await supabase.auth.getUser()
  if (!user || sessionError) {
    redirect('/login')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    // Error diferente a "no encontrado"
    console.error('getMyProfile failed:', error)
    return { data: null, error: 'Error al cargar perfil.' }
  }

  return { data: data || null, error: null }
}

export async function saveMyProfile(formData: ProfileData) {
  const validated = validateProfileInput(formData, { requireLocationId: true, requireCityZone: false })
  if (!validated.ok) {
    return { error: validated.error }
  }
  const { display_name, city, zone, location_id, avatar_url } = validated.data

  const supabase = createServerSupabaseClient()

  const { data: { user }, error: sessionError } = await supabase.auth.getUser()
  if (!user || sessionError) {
    return { error: 'No autorizado. Por favor inicia sesión.' }
  }

  const upsertPayload: Record<string, unknown> = {
    user_id: user.id,
    display_name,
    city,
    zone,
    avatar_url,
  }
  if (location_id) upsertPayload.location_id = location_id

  const { data, error } = await supabase
    .from('profiles')
    .upsert(upsertPayload, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    console.error('saveMyProfile failed:', error)
    return { error: 'Error al guardar perfil. Intenta de nuevo.' }
  }

  // Si OK => redirect a /onboarding/step-2
  redirect('/onboarding/step-2')
}

