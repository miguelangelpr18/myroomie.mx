'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

/**
 * Crear o encontrar thread para un listing y redirigir a /messages/[thread_id]
 */
export async function getOrCreateListingThread(listingId: string) {
  const supabase = createServerSupabaseClient()

  // Verificar sesión
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (!session || sessionError) {
    redirect('/login?intent=roomies')
  }

  const viewerId = session.user.id

  // Obtener owner del listing
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('user_id')
    .eq('id', listingId)
    .single()

  if (listingError || !listing) {
    redirect('/listings')
  }

  const ownerId = listing.user_id

  // Si el viewer es el owner, no permitir
  if (viewerId === ownerId) {
    // No hacer nada, el componente no debería mostrar el botón en este caso
    return
  }

  // Ordenar user_ids para buscar thread existente
  const user1Id = viewerId < ownerId ? viewerId : ownerId
  const user2Id = viewerId < ownerId ? ownerId : viewerId

  // Buscar thread existente con listing_id
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

  // Si existe, redirigir
  if (existingThread) {
    redirect(`/messages/${existingThread.id}`)
  }

  // Si no existe, crear nuevo thread
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

/**
 * Toggle guardar listing (wishlist)
 * Si existe → delete, si no existe → insert
 * Server action compatible con <form action>
 */
export async function toggleSave(listingId: string, formData: FormData): Promise<void> {
  const supabase = createServerSupabaseClient()

  // Verificar sesión
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (!session || sessionError) {
    redirect('/login?intent=roomies')
  }

  const userId = session.user.id

  // Verificar que el listing existe
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id')
    .eq('id', listingId)
    .single()

  if (listingError || !listing) {
    throw new Error('Anuncio no encontrado.')
  }

  // Verificar si ya está guardado
  const { data: existingSave, error: checkError } = await supabase
    .from('listing_saves')
    .select('id')
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .maybeSingle()

  if (checkError && checkError.code !== 'PGRST116') {
    throw new Error(`Error al verificar: ${checkError.message}`)
  }

  // Si existe, eliminar
  if (existingSave) {
    const { error: deleteError } = await supabase
      .from('listing_saves')
      .delete()
      .eq('id', existingSave.id)

    if (deleteError) {
      throw new Error(`Error al eliminar: ${deleteError.message}`)
    }
  } else {
    // Si no existe, crear
    const { error: insertError } = await supabase
      .from('listing_saves')
      .insert({
        user_id: userId,
        listing_id: listingId,
      })

    if (insertError) {
      throw new Error(`Error al guardar: ${insertError.message}`)
    }
  }

  // Revalidar paths
  revalidatePath(`/listings/${listingId}`)
  revalidatePath('/saved')
}

