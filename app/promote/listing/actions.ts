'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function activateListingPromotion(listingId: string, planDays: number) {
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

  // Validar que listingId pertenece al usuario y leer featured_until actual
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('user_id, featured_until')
    .eq('id', listingId)
    .single()

  if (listingError || !listing) {
    return { error: 'Anuncio no encontrado.' }
  }

  if (listing.user_id !== session.user.id) {
    return { error: 'No autorizado. Solo puedes promocionar tus propios anuncios.' }
  }

  // Calcular baseDate: si featured_until existe y está en el futuro, extender desde ahí; sino desde now
  const now = new Date()
  const currentFeaturedUntil = listing.featured_until ? new Date(listing.featured_until) : null

  const baseDate =
    currentFeaturedUntil && currentFeaturedUntil > now ? currentFeaturedUntil : now

  // Calcular nuevo featured_until = baseDate + planDays días
  const featuredUntil = new Date(baseDate.getTime() + planDays * 24 * 60 * 60 * 1000)

  // UPDATE listings SET featured_until = computed WHERE id = listingId
  const { data, error } = await supabase
    .from('listings')
    .update({
      featured_until: featuredUntil.toISOString(),
    })
    .eq('id', listingId)
    .select()
    .single()

  if (error) {
    return { error: error.message || 'Error al activar promoción.' }
  }

  // Revalidar paths
  revalidatePath('/listings')
  revalidatePath(`/listings/${listingId}`)
  revalidatePath('/dashboard')

  return { data, error: null }
}

