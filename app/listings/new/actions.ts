'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { validateListingInput } from '@/app/lib/validation/listing'

export interface ListingData {
  title: string
  description: string
  city: string
  zone: string
  price_mxn: number | null
  listing_type: 'room' | 'roommate'
  location_id?: string | null
}

export async function createListing(formData: ListingData) {
  const validated = validateListingInput(formData)
  if (!validated.ok) {
    return { error: validated.error }
  }
  const { title, description, city, zone, price_mxn, listing_type, location_id } = validated.data

  const supabase = createServerSupabaseClient()

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (!session || sessionError) {
    return { error: 'No autorizado. Por favor inicia sesión.' }
  }

  const insertPayload: Record<string, unknown> = {
    user_id: session.user.id,
    title,
    description,
    city,
    zone,
    price_mxn,
    listing_type,
  }
  if (location_id) insertPayload.location_id = location_id

  const { data, error } = await supabase
    .from('listings')
    .insert(insertPayload)
    .select('id, location_id')
    .single()

  if (error) {
    return { error: error.message, listingId: null }
  }

  return { error: null, listingId: data.id, locationId: data.location_id ?? null }
}

/**
 * Adjuntar URLs de imágenes a un listing
 * Valida ownership antes de actualizar
 */
export async function attachListingImages(listingId: string, imageUrls: string[]) {
  const supabase = createServerSupabaseClient()

  // Verificar sesión
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (!session || sessionError) {
    return { error: 'No autorizado. Por favor inicia sesión.' }
  }

  // Validar que el listing existe y pertenece al usuario
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('user_id')
    .eq('id', listingId)
    .single()

  if (listingError || !listing) {
    return { error: 'Anuncio no encontrado.' }
  }

  if (listing.user_id !== session.user.id) {
    return { error: 'No autorizado. Solo puedes actualizar tus propios anuncios.' }
  }

  // Validar imageUrls (array de strings)
  if (!Array.isArray(imageUrls)) {
    return { error: 'imageUrls debe ser un array.' }
  }

  // Actualizar image_urls
  const { error: updateError } = await supabase
    .from('listings')
    .update({ image_urls: imageUrls })
    .eq('id', listingId)
    .eq('user_id', session.user.id) // Doble validación de ownership

  if (updateError) {
    return { error: updateError.message || 'Error al actualizar imágenes.' }
  }

  // Revalidar paths
  revalidatePath('/listings')
  revalidatePath(`/listings/${listingId}`)
  revalidatePath('/dashboard')

  return { error: null }
}


