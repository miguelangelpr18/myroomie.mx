'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ListingData {
  title: string
  description: string
  city: string
  zone: string
  price_mxn: number | null
  listing_type: 'room' | 'roommate'
}

export async function createListing(formData: ListingData) {
  const supabase = createServerSupabaseClient()

  // Verificar sesión
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (!session || sessionError) {
    return { error: 'No autorizado. Por favor inicia sesión.' }
  }

  // Validaciones server-side
  const { title, description, city, zone, price_mxn, listing_type } = formData

  if (!title || title.trim().length < 6) {
    return { error: 'El título debe tener al menos 6 caracteres' }
  }

  if (!description || description.trim().length < 30) {
    return { error: 'La descripción debe tener al menos 30 caracteres' }
  }

  if (!city || city.trim().length < 2) {
    return { error: 'La ciudad debe tener al menos 2 caracteres' }
  }

  if (!zone || zone.trim().length < 2) {
    return { error: 'La zona debe tener al menos 2 caracteres' }
  }

  if (listing_type !== 'room' && listing_type !== 'roommate') {
    return { error: 'Tipo de listing inválido' }
  }

  // Validar price_mxn si viene
  if (price_mxn !== null && price_mxn !== undefined) {
    const price = typeof price_mxn === 'string' ? parseInt(price_mxn, 10) : price_mxn
    if (isNaN(price) || price < 0) {
      return { error: 'El precio debe ser un número entero mayor o igual a 0' }
    }
  }

  // Insertar listing
  const { data, error } = await supabase
    .from('listings')
    .insert({
      user_id: session.user.id,
      title: title.trim(),
      description: description.trim(),
      city: city.trim(),
      zone: zone.trim(),
      price_mxn: price_mxn !== null && price_mxn !== undefined ? (typeof price_mxn === 'string' ? parseInt(price_mxn, 10) : price_mxn) : null,
      listing_type: listing_type,
    })
    .select('id')
    .single()

  if (error) {
    return { error: error.message, listingId: null }
  }

  // Retornar listingId en lugar de redirect (el cliente manejará el redirect después de subir imágenes)
  return { error: null, listingId: data.id }
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


