import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireProfileOrRedirect } from '@/lib/requireProfile'
import Link from 'next/link'
import MessageForm from './MessageForm'
import LifestyleBadges from '../../components/LifestyleBadges'
import { markThreadAsRead } from '../actions'

export default async function ThreadPage({
  params,
}: {
  params: { thread_id: string }
}) {
  // Verificar que el usuario tenga perfil
  await requireProfileOrRedirect()

  const supabase = createServerSupabaseClient()

  // Obtener sesión
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return null // requireProfileOrRedirect ya maneja redirect
  }

  // Obtener thread
  const { data: thread, error: threadError } = await supabase
    .from('threads')
    .select('id, user1_id, user2_id, listing_id')
    .eq('id', params.thread_id)
    .single()

  // Verificar que el usuario es participant (después de verificar que existe)
  const isParticipant = thread && (thread.user1_id === session.user.id || thread.user2_id === session.user.id)

  // Si no existe o hay error o no es participante, mostrar error amigable
  if (!thread || threadError || !isParticipant) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Conversación no disponible
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            No tienes acceso a esta conversación o ya no existe.
          </p>
          <Link
            href="/messages"
            className="inline-block bg-[#FF7A18] text-white px-6 py-2 rounded-lg hover:bg-[#E86F14] text-sm font-medium"
          >
            Volver a mensajes
          </Link>
        </div>
      </div>
    )
  }

  // Marcar thread como leído al abrirlo
  await markThreadAsRead(params.thread_id)

  // Identificar el otro usuario
  const otherUserId = thread.user1_id === session.user.id 
    ? thread.user2_id 
    : thread.user1_id

  // Obtener perfil del otro usuario
  const { data: otherProfile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, pets, smoker, cleanliness, parties, schedule')
    .eq('user_id', otherUserId)
    .single()

  // Obtener mensajes del thread
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('id, sender_id, body, created_at')
    .eq('thread_id', params.thread_id)
    .order('created_at', { ascending: true })
    .limit(100)

  const initial = otherProfile?.display_name?.charAt(0).toUpperCase() || '?'

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/messages"
          className="text-[#FF7A18] hover:underline text-sm"
        >
          ← Volver a mensajes
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center gap-4 mb-4">
          {otherProfile?.avatar_url ? (
            <img
              src={otherProfile.avatar_url}
              alt={otherProfile.display_name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#FF7A18] text-white flex items-center justify-center text-xl font-semibold">
              {initial}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{otherProfile?.display_name || 'Usuario'}</h1>
            {otherProfile && <LifestyleBadges profile={otherProfile} />}
            {thread.listing_id && (
              <Link
                href={`/listings/${thread.listing_id}`}
                className="text-sm text-[#FF7A18] hover:underline mt-2 block"
              >
                Ver listing relacionado
              </Link>
            )}
          </div>
        </div>
      </div>

      {messagesError && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6">
          Error al cargar mensajes: {messagesError.message}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow min-h-[400px] max-h-[600px] overflow-y-auto overflow-x-hidden">
        {!messages || messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No hay mensajes aún.</p>
            <p className="text-sm mt-2">Envía el primer mensaje abajo.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.sender_id === session.user.id

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] md:max-w-[65%] rounded-lg px-4 py-2 overflow-hidden min-w-0 ${
                      isOwn
                        ? 'bg-[#FF7A18] text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words" style={{ overflowWrap: 'anywhere' }}>{message.body}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-white/80' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.created_at).toLocaleString('es-MX', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <MessageForm threadId={params.thread_id} />
    </div>
  )
}

