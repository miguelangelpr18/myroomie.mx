'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { checkActionRateLimit } from '@/app/lib/rateLimit'

export async function findOrCreateThread(otherUserId: string, listingId: string | null) {
  const supabase = createServerSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user || authError) {
    return { error: 'No autorizado. Por favor inicia sesión.' }
  }

  const currentUserId = user.id

  if (currentUserId === otherUserId) {
    return { error: 'No puedes crear un thread contigo mismo.' }
  }

  const user1Id = currentUserId < otherUserId ? currentUserId : otherUserId
  const user2Id = currentUserId < otherUserId ? otherUserId : currentUserId

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

  if (existingThread) {
    return { data: existingThread.id, error: null }
  }

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

export async function sendMessage(threadId: string, body: string) {
  const supabase = createServerSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user || authError) {
    return { error: 'No autorizado. Por favor inicia sesión.' }
  }

  if (!(await checkActionRateLimit(user.id, 'sendMessage', 20, '60 s'))) {
    return { error: 'Estás enviando mensajes muy rápido. Espera un momento.' }
  }

  if (!body || body.trim().length === 0) {
    return { error: 'El mensaje no puede estar vacío.' }
  }

  if (body.trim().length > 5000) {
    return { error: 'El mensaje es demasiado largo (máximo 5000 caracteres).' }
  }

  const { data: thread, error: threadError } = await supabase
    .from('threads')
    .select('user1_id, user2_id')
    .eq('id', threadId)
    .single()

  if (!thread || threadError) {
    return { error: 'Thread no encontrado.' }
  }

  if (thread.user1_id !== user.id && thread.user2_id !== user.id) {
    return { error: 'No tienes permiso para enviar mensajes en este thread.' }
  }

  const { data: message, error: insertError } = await supabase
    .from('messages')
    .insert({
      thread_id: threadId,
      sender_id: user.id,
      body: body.trim(),
    })
    .select('id')
    .single()

  if (insertError) {
    return { error: `Error al enviar mensaje: ${insertError.message}` }
  }

  revalidatePath(`/messages/${threadId}`)

  return { data: message.id, error: null }
}

export async function markThreadAsRead(threadId: string) {
  const supabase = createServerSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user || authError) {
    return { error: 'No autorizado. Por favor inicia sesión.' }
  }

  const currentUserId = user.id

  const { data: currentProfile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', currentUserId)
    .single()

  if (!currentProfile || profileError) {
    return { error: 'Perfil no encontrado.' }
  }

  const currentProfileId = currentProfile.user_id

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

  return { data: null, error: null }
}
