import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireProfileOrRedirect } from '@/lib/requireProfile'
import Link from 'next/link'
import MessageForm from './MessageForm'
import LifestyleBadges from '../../components/LifestyleBadges'
import Avatar from '../../components/ui/Avatar'
import { markThreadAsRead } from '../actions'

export default async function ThreadPage({
  params,
}: {
  params: { thread_id: string }
}) {
  const { user } = await requireProfileOrRedirect()

  const supabase = createServerSupabaseClient()

  const viewerId = user.id

  // Obtener thread
  const { data: thread, error: threadError } = await supabase
    .from('threads')
    .select('id, user1_id, user2_id, listing_id')
    .eq('id', params.thread_id)
    .single()

  // Verificar que el usuario es participant (después de verificar que existe)
  const isParticipant = thread && (thread.user1_id === viewerId || thread.user2_id === viewerId)

  if (!thread || threadError || !isParticipant) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center py-12 bg-neutral-50 rounded-xl border border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Conversación no disponible
          </h2>
          <p className="text-neutral-500 text-sm mb-4">
            No tienes acceso a esta conversación o ya no existe.
          </p>
          <Link
            href="/messages"
            className="inline-block bg-brand text-white px-6 py-2 rounded-lg hover:bg-brandHover text-sm font-medium"
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
  const otherUserId = thread.user1_id === viewerId 
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
          className="text-brand hover:underline text-sm"
        >
          ← Volver a mensajes
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar
            src={otherProfile?.avatar_url}
            alt={otherProfile?.display_name || 'Usuario'}
            size="lg"
            initial={initial}
          />
          <div>
            <h1 className="text-2xl font-bold">{otherProfile?.display_name || 'Usuario'}</h1>
            {otherProfile && <LifestyleBadges profile={otherProfile} />}
            {thread.listing_id && (
              <Link
                href={`/listings/${thread.listing_id}`}
                className="text-sm text-brand hover:underline mt-2 block"
              >
                Ver listing relacionado
              </Link>
            )}
          </div>
        </div>
      </div>

      {messagesError && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg mb-6 text-sm">
          Error al cargar los mensajes. Intenta de nuevo.
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm min-h-[400px] max-h-[600px] overflow-y-auto overflow-x-hidden">
        {!messages || messages.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <p className="font-medium">No hay mensajes aún.</p>
            <p className="text-sm mt-2 text-neutral-400">Envía el primer mensaje abajo.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.sender_id === viewerId

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] md:max-w-[65%] rounded-2xl px-4 py-3 overflow-hidden min-w-0 ${
                      isOwn
                        ? 'bg-brand text-white'
                        : 'bg-neutral-100 text-neutral-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed" style={{ overflowWrap: 'anywhere' }}>{message.body}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-white/80' : 'text-neutral-400'
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

