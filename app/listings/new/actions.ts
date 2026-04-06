'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { validateListingInput } from '@/app/lib/validation/listing'
import { checkActionRateLimit } from '@/app/lib/rateLimit'

export interface ListingData {
  title: string
  description: string
  city: string
  zone: string
  price_mxn: number | null
  listing_type: 'room' | 'roommate'
  location_id?: string | null
  listing_subtype?: 'solo_renta' | 'buscar_roomie'
  lifestyle_prefs?: Record<string, unknown> | null
  amenities?: string[]
}

export async function createListing(formData: ListingData) {
  const validated = validateListingInput(formData)
  if (!validated.ok) {
    return { error: validated.error }
  }
  const { title, description, city, zone, price_mxn, listing_type, location_id, listing_subtype, lifestyle_prefs, amenities } = validated.data

  const supabase = createServerSupabaseClient()

  const { data: { user }, error: sessionError } = await supabase.auth.getUser()
  if (!user || sessionError) {
    return { error: 'No autorizado. Por favor inicia sesión.' }
  }

  if (!(await checkActionRateLimit(user.id, 'createListing', 5, '60 s'))) {
    return { error: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.' }
  }

  const insertPayload: Record<string, unknown> = {
    user_id: user.id,
    title,
    description,
    city,
    zone,
    price_mxn,
    listing_type,
  }
  if (location_id) insertPayload.location_id = location_id
  if (listing_subtype) insertPayload.listing_subtype = listing_subtype
  if (lifestyle_prefs) insertPayload.lifestyle_prefs = lifestyle_prefs
  if (amenities && amenities.length > 0) insertPayload.amenities = amenities

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

const SUPABASE_STORAGE_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`
const MAX_IMAGES = 10

function isValidStorageUrl(url: string): boolean {
  return url.startsWith(SUPABASE_STORAGE_PREFIX)
}

/**
 * Adjuntar URLs de imágenes a un listing.
 * Solo acepta URLs de Supabase Storage. Ownership se valida atómicamente en el UPDATE.
 */
export async function attachListingImages(listingId: string, imageUrls: string[]) {
  const supabase = createServerSupabaseClient()

  const { data: { user }, error: sessionError } = await supabase.auth.getUser()
  if (!user || sessionError) {
    return { error: 'No autorizado. Por favor inicia sesión.' }
  }

  if (!Array.isArray(imageUrls)) {
    return { error: 'imageUrls debe ser un array.' }
  }

  if (imageUrls.length > MAX_IMAGES) {
    return { error: `Máximo ${MAX_IMAGES} imágenes por anuncio.` }
  }

  for (const url of imageUrls) {
    if (typeof url !== 'string' || !isValidStorageUrl(url)) {
      return { error: 'Una o más URLs de imagen no son válidas.' }
    }
  }

  // Ownership check atómico: el .eq('user_id') en el UPDATE previene TOCTOU
  const { data, error: updateError } = await supabase
    .from('listings')
    .update({ image_urls: imageUrls })
    .eq('id', listingId)
    .eq('user_id', user.id)
    .select('id')

  if (updateError) {
    return { error: 'Error al actualizar imágenes.' }
  }

  if (!data || data.length === 0) {
    return { error: 'Anuncio no encontrado o no autorizado.' }
  }

  revalidatePath('/listings')
  revalidatePath(`/listings/${listingId}`)
  revalidatePath('/dashboard')

  return { error: null }
}


