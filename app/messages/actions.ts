'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

/**
 * Crear o encontrar thread entre dos usuarios
 */
export async function findOrCreateThread(otherUserId: string, listingId: string | null) {
  const supabase = createServerSupabaseClient()

  // Verificar sesión
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (!session || sessionError) {
    return { error: 'No autorizado. Por favor inicia sesión.' }
  }

  const currentUserId = session.user.id

  // No permitir thread consigo mismo
  if (currentUserId === otherUserId) {
    return { error: 'No puedes crear un thread contigo mismo.' }
  }

  // Ordenar user_ids para buscar thread existente
  const user1Id = currentUserId < otherUserId ? currentUserId : otherUserId
  const user2Id = currentUserId < otherUserId ? otherUserId : currentUserId

  // Buscar thread existente
  let query = supabase
    .from('threads')
    .select('id')
    .eq('user1_id', user1Id)
    .eq('user2_id', user2Id)
  
  if (listingId) {
    query = query.eq('listing_id', listingId)
  } else {
    query = query.is('listing_id', null)
  }
  
  const { data: existingThread, error: searchError } = await query.maybeSingle()

  if (searchError && searchError.code !== 'PGRST116') {
    return { error: `Error al buscar thread: ${searchError.message}` }
  }

  // Si existe, retornar su id
  if (existingThread) {
    return { data: existingThread.id, error: null }
  }

  // Si no existe, crear nuevo thread
  // Usar user_ids ordenados para consistencia con el unique index
  const { data: newThread, error: createError } = await supabase
    .from('threads')
    .insert({
      user1_id: user1Id,
      user2_id: user2Id,
      listing_id: listingId || null,
    })
    .select('id')
    .single()

  if (createError) {
    return { error: `Error al crear thread: ${createError.message}` }
  }

  return { data: newThread.id, error: null }
}

/**
 * Enviar mensaje en un thread
 */
export async function sendMessage(threadId: string, body: string) {
  const supabase = createServerSupabaseClient()

  // Verificar sesión
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (!session || sessionError) {
    return { error: 'No autorizado. Por favor inicia sesión.' }
  }

  // Validar body
  if (!body || body.trim().length === 0) {
    return { error: 'El mensaje no puede estar vacío.' }
  }

  if (body.trim().length > 5000) {
    return { error: 'El mensaje es demasiado largo (máximo 5000 caracteres).' }
  }

  // Verificar que el usuario es participant del thread
  const { data: thread, error: threadError } = await supabase
    .from('threads')
    .select('user1_id, user2_id')
    .eq('id', threadId)
    .single()

  if (!thread || threadError) {
    return { error: 'Thread no encontrado.' }
  }

  if (thread.user1_id !== session.user.id && thread.user2_id !== session.user.id) {
    return { error: 'No tienes permiso para enviar mensajes en este thread.' }
  }

  // Insertar mensaje
  const { data: message, error: insertError } = await supabase
    .from('messages')
    .insert({
      thread_id: threadId,
      sender_id: session.user.id,
      body: body.trim(),
    })
    .select('id')
    .single()

  if (insertError) {
    return { error: `Error al enviar mensaje: ${insertError.message}` }
  }

  // Revalidar la página del thread
  revalidatePath(`/messages/${threadId}`)

  return { data: message.id, error: null }
}

/**
 * Marcar thread como leído (actualizar last_read_at)
 */
export async function markThreadAsRead(threadId: string) {
  const supabase = createServerSupabaseClient()

  // Verificar sesión
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (!session || sessionError) {
    return { error: 'No autorizado. Por favor inicia sesión.' }
  }

  const currentUserId = session.user.id

  // Obtener perfil del usuario actual (profile.user_id = auth.uid())
  const { data: currentProfile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', currentUserId)
    .single()

  if (!currentProfile || profileError) {
    return { error: 'Perfil no encontrado.' }
  }

  const currentProfileId = currentProfile.user_id

  // Verificar que el usuario es participant del thread
  const { data: thread, error: threadError } = await supabase
    .from('threads')
    .select('user1_id, user2_id')
    .eq('id', threadId)
    .single()

  if (!thread || threadError) {
    return { error: 'Thread no encontrado.' }
  }

  if (thread.user1_id !== currentUserId && thread.user2_id !== currentUserId) {
    return { error: 'No tienes permiso para acceder a este thread.' }
  }

  // Upsert en thread_participants usando profile_id (que es igual a user_id pero referencia profiles)
  const { error: upsertError } = await supabase
    .from('thread_participants')
    .upsert({
      thread_id: threadId,
      profile_id: currentProfileId,
      last_read_at: new Date().toISOString(),
    }, {
      onConflict: 'thread_id,profile_id',
    })

  if (upsertError) {
    return { error: `Error al marcar thread como leído: ${upsertError.message}` }
  }

  // NO revalidar aquí - el refresh sucede por navegación/cambio de searchParams
  // Si hace falta, se puede forzar router.refresh del lado cliente (FASE 4O.3)

  return { data: null, error: null }
}

