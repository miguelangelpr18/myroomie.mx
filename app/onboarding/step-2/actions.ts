'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
  const supabase = createServerSupabaseClient()

  // Verificar sesión
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (!session || sessionError) {
    return { error: 'No autorizado. Por favor inicia sesión.' }
  }

  // Validaciones server-side
  const { pets, smoker, cleanliness, parties, schedule } = formData

  // cleanliness es requerido (1-3)
  if (cleanliness === null || cleanliness === undefined) {
    return { error: 'El nivel de limpieza es requerido' }
  }

  if (cleanliness < 1 || cleanliness > 3) {
    return { error: 'El nivel de limpieza debe ser 1, 2 o 3' }
  }

  // schedule es requerido ('day'|'night')
  if (!schedule || (schedule !== 'day' && schedule !== 'night')) {
    return { error: 'El horario es requerido (día o noche)' }
  }

  // Asegurar que pets, smoker, parties son boolean
  const petsBool = Boolean(pets)
  const smokerBool = Boolean(smoker)
  const partiesBool = Boolean(parties)

  // Update perfil
  const { data, error } = await supabase
    .from('profiles')
    .update({
      pets: petsBool,
      smoker: smokerBool,
      cleanliness: cleanliness,
      parties: partiesBool,
      schedule: schedule,
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



