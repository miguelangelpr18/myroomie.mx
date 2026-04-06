'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export interface UpdateListingData {
  title: string
  description: string
  city: string
  zone: string
  price_mxn: number | null
  listing_type: 'room' | 'roommate'
  location_id?: string | null
  listing_subtype?: 'solo_renta' | 'buscar_roomie' | null
  lifestyle_prefs?: Record<string, unknown> | null
  amenities?: string[]
  is_active?: boolean
}

export async function updateListing(listingId: string, data: UpdateListingData) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  // Ownership check atómico: .eq('user_id', user.id) en el UPDATE previene TOCTOU
  const { data: updated, error } = await supabase
    .from('listings')
    .update({
      title: data.title,
      description: data.description,
      city: data.city,
      zone: data.zone,
      price_mxn: data.price_mxn,
      listing_type: data.listing_type,
      ...(data.location_id !== undefined && { location_id: data.location_id }),
      ...(data.listing_subtype !== undefined && { listing_subtype: data.listing_subtype }),
      ...(data.lifestyle_prefs !== undefined && { lifestyle_prefs: data.lifestyle_prefs }),
      ...(data.amenities !== undefined && { amenities: data.amenities }),
      ...(data.is_active !== undefined && { is_active: data.is_active }),
    })
    .eq('id', listingId)
    .eq('user_id', user.id)
    .select('id')

  if (error) return { error: 'Error al actualizar anuncio.' }

  if (!updated || updated.length === 0) {
    return { error: 'Anuncio no encontrado o no tienes permiso para editarlo.' }
  }

  revalidatePath(`/listings/${listingId}`)
  revalidatePath('/listings')
  revalidatePath('/dashboard')
  return { error: null }
}

export async function deleteListing(listingId: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)
    .eq('user_id', user.id)

  if (error) {
    console.error('deleteListing failed:', error)
    return { error: 'Error al eliminar el anuncio. Intenta de nuevo.' }
  }

  revalidatePath('/listings')
  revalidatePath('/dashboard')
  return { error: null }
}

export async function toggleListingActive(listingId: string, isActive: boolean) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { error } = await supabase
    .from('listings')
    .update({ is_active: isActive })
    .eq('id', listingId)
    .eq('user_id', user.id)

  if (error) {
    console.error('toggleListingActive failed:', error)
    return { error: 'Error al cambiar estado del anuncio.' }
  }

  revalidatePath(`/listings/${listingId}`)
  revalidatePath('/listings')
  revalidatePath('/dashboard')
  return { error: null }
}

export async function getOrCreateListingThread(listingId: string) {
  const supabase = createServerSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user || authError) {
    redirect('/login?intent=roomies')
  }

  const viewerId = user.id

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('user_id')
    .eq('id', listingId)
    .single()

  if (listingError || !listing) {
    redirect('/listings')
  }

  const ownerId = listing.user_id

  if (viewerId === ownerId) {
    return
  }

  const user1Id = viewerId < ownerId ? viewerId : ownerId
  const user2Id = viewerId < ownerId ? ownerId : viewerId

  const { data: existingThread, error: searchError } = await supabase
    .from('threads')
    .select('id')
    .eq('user1_id', user1Id)
    .eq('user2_id', user2Id)
    .eq('listing_id', listingId)
    .maybeSingle()

  if (searchError && searchError.code !== 'PGRST116') {
    redirect(`/listings/${listingId}?error=thread_search_failed`)
  }

  if (existingThread) {
    redirect(`/messages/${existingThread.id}`)
  }

  const { data: newThread, error: createError } = await supabase
    .from('threads')
    .insert({
      user1_id: user1Id,
      user2_id: user2Id,
      listing_id: listingId,
    })
    .select('id')
    .single()

  if (createError) {
    redirect(`/listings/${listingId}?error=thread_create_failed`)
  }

  redirect(`/messages/${newThread.id}`)
}

export async function toggleSave(listingId: string, formData: FormData): Promise<void> {
  const supabase = createServerSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user || authError) {
    redirect('/login?intent=roomies')
  }

  const userId = user.id

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id')
    .eq('id', listingId)
    .single()

  if (listingError || !listing) {
    throw new Error('Anuncio no encontrado.')
  }

  const { data: existingSave, error: checkError } = await supabase
    .from('listing_saves')
    .select('id')
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .maybeSingle()

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('toggleSave check failed:', checkError)
    throw new Error('Error al verificar guardado.')
  }

  if (existingSave) {
    const { error: deleteError } = await supabase
      .from('listing_saves')
      .delete()
      .eq('id', existingSave.id)

    if (deleteError) {
      console.error('toggleSave delete failed:', deleteError)
      throw new Error('Error al quitar de guardados.')
    }
  } else {
    const { error: insertError } = await supabase
      .from('listing_saves')
      .insert({
        user_id: userId,
        listing_id: listingId,
      })

    if (insertError) {
      console.error('toggleSave insert failed:', insertError)
      throw new Error('Error al guardar anuncio.')
    }
  }

  revalidatePath(`/listings/${listingId}`)
  revalidatePath('/saved')
}
