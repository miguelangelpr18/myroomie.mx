'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { validateProfileLifestyleInput } from '@/app/lib/validation/profile'

export interface LifestyleData {
  pets: boolean
  smoker: boolean
  cleanliness: number | null
  parties: boolean
  schedule: string | null
}

export async function getMyLifestyle() {
  const supabase = createServerSupabaseClient()

  // Verificar sesión
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (!session || sessionError) {
    redirect('/login')
  }

  // Buscar perfil del usuario
  const { data, error } = await supabase
    .from('profiles')
    .select('pets, smoker, cleanliness, parties, schedule')
    .eq('user_id', session.user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    // Error diferente a "no encontrado"
    return { data: null, error: error.message }
  }

  return { data: data || null, error: null }
}

export async function saveMyLifestyle(formData: LifestyleData) {
  const validated = validateProfileLifestyleInput(formData)
  if (!validated.ok) {
    return { error: validated.error }
  }
  const { pets, smoker, cleanliness, parties, schedule } = validated.data

  const supabase = createServerSupabaseClient()

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (!session || sessionError) {
    return { error: 'No autorizado. Por favor inicia sesión.' }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      pets,
      smoker,
      cleanliness,
      parties,
      schedule,
    })
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Si OK => redirect a home
  redirect('/')
}



