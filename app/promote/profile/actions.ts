'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function activateProfilePromotion(planDays: number) {
  const supabase = createServerSupabaseClient()

  // Validar sesión
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (!session || sessionError) {
    return { error: 'No autorizado. Por favor inicia sesión.' }
  }

  // Validar planDays
  if (!planDays || planDays <= 0 || planDays > 365) {
    return { error: 'Duración del plan inválida.' }
  }

  // Leer featured_until actual
  const { data: currentProfile, error: readError } = await supabase
    .from('profiles')
    .select('featured_until')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (readError) {
    return { error: readError.message || 'Error al leer perfil.' }
  }

  // Calcular baseDate: si featured_until existe y está en el futuro, extender desde ahí; sino desde now
  const now = new Date()
  const currentFeaturedUntil = currentProfile?.featured_until
    ? new Date(currentProfile.featured_until)
    : null

  const baseDate =
    currentFeaturedUntil && currentFeaturedUntil > now ? currentFeaturedUntil : now

  // Calcular nuevo featured_until = baseDate + planDays días
  const featuredUntil = new Date(baseDate.getTime() + planDays * 24 * 60 * 60 * 1000)

  // Update profiles set featured_until = computed where user_id = session.user.id
  const { data, error } = await supabase
    .from('profiles')
    .update({
      featured_until: featuredUntil.toISOString(),
    })
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message || 'Error al activar promoción.' }
  }

  // Revalidar paths
  revalidatePath('/dashboard')
  revalidatePath('/explore')
  revalidatePath(`/profiles/${session.user.id}`)

  return { data, error: null }
}

