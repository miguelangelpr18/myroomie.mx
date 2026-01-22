import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireProfileOrRedirect } from '@/lib/requireProfile'
import Link from 'next/link'
import MessageForm from './[thread_id]/MessageForm'
import LifestyleBadges from '../components/LifestyleBadges'
import AutoScrollToBottom from './AutoScrollToBottom'

export default async function ThreadPanel({ threadId }: { threadId: string }) {
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
    .eq('id', threadId)
    .single()

  // Verificar que el usuario es participant (después de verificar que existe)
  const isParticipant = thread && (thread.user1_id === session.user.id || thread.user2_id === session.user.id)

  // Si no existe o hay error o no es participante, mostrar error amigable dentro del panel
  if (!thread || threadError || !isParticipant) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">
            Conversación no disponible
          </h2>
          <p className="text-sm text-neutral-600">
            No tienes acceso a esta conversación o ya no existe.
          </p>
        </div>
      </div>
    )
  }

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
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(100)

  const initial = otherProfile?.display_name?.charAt(0).toUpperCase() || '?'

  return (
    <div className="flex flex-col w-full h-full min-w-0 min-h-0">
      {/* Header fijo */}
      <div className="flex-shrink-0 border-b border-neutral-200 bg-white p-4">
        <div className="flex items-center gap-3">
          {otherProfile?.avatar_url ? (
            <img
              src={otherProfile.avatar_url}
              alt={otherProfile.display_name || 'Usuario'}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#FF7A18] text-white flex items-center justify-center text-lg font-semibold flex-shrink-0">
              {initial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">{otherProfile?.display_name || 'Usuario'}</h1>
            {otherProfile && (
              <div className="mt-1">
                <LifestyleBadges profile={otherProfile} />
              </div>
            )}
            {thread.listing_id && (
              <Link
                href={`/listings/${thread.listing_id}`}
                className="text-xs text-[#FF7A18] hover:underline mt-1 inline-block"
              >
                Ver listing relacionado
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Body scroll */}
      <div className="flex-1 overflow-y-auto px-5 py-4 min-w-0 min-h-0 bg-neutral-50">
        {messagesError && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
            <p className="text-sm">Error al cargar mensajes: {messagesError.message}</p>
          </div>
        )}

        {!messages || messages.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <p className="text-sm">No hay mensajes aún.</p>
            <p className="text-xs mt-2">Envía el primer mensaje abajo.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isOwn = message.sender_id === session.user.id

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 overflow-hidden min-w-0 ${
                      isOwn
                        ? 'bg-[#FF7A18] text-white'
                        : 'bg-neutral-100 text-neutral-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm">{message.body}</p>
                    <p
                      className={`text-xs mt-1.5 ${
                        isOwn ? 'text-white/80' : 'text-neutral-500'
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
            <AutoScrollToBottom dep={`${threadId}:${messages?.length ?? 0}`} />
          </div>
        )}
      </div>

      {/* Footer fijo con form */}
      <div className="flex-shrink-0 border-t border-neutral-200 bg-white p-4">
        <MessageForm threadId={threadId} />
      </div>
    </div>
  )
}

