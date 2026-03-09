import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireProfileOrRedirect } from '@/lib/requireProfile'
import Link from 'next/link'
import EmptyState from '../components/ui/EmptyState'
import ThreadPanel from './ThreadPanel'
import InboxSearch from './InboxSearch'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mensajes',
}

interface MessagesPageProps {
  searchParams?: { thread?: string }
}

// Componente interno para cada fila de thread
function ThreadRow({
  thread,
  selectedThreadId,
  isUnread,
}: {
  thread: {
    id: string
    otherUser: {
      display_name: string | null
      avatar_url: string | null
      pets?: boolean | null
      smoker?: boolean | null
      cleanliness?: number | string | null
      parties?: boolean | null
      schedule?: string | null
    } | null
    lastMessage: { body: string; created_at: string; sender_id: string } | null
  }
  selectedThreadId: string | null
  isUnread: boolean
}) {
  const otherUser = thread.otherUser
  const initial = otherUser?.display_name?.charAt(0).toUpperCase() || '?'
  const isSelected = thread.id === selectedThreadId

  return (
    <div className="relative">
      {/* Barra izquierda naranja cuando está seleccionado (desktop) */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand rounded-r-full hidden lg:block" />
      )}
      
      {/* Link mobile: navega a /messages/[id] */}
      <Link
        href={`/messages/${thread.id}`}
        className={`lg:hidden block px-4 py-3 hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30 focus:ring-offset-2 rounded-lg ${
          isSelected ? 'bg-brand/5' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          {otherUser?.avatar_url ? (
            <img
              src={otherUser.avatar_url}
              alt={otherUser.display_name || 'Usuario'}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center text-base font-semibold flex-shrink-0">
              {initial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm mb-0.5 truncate ${
              isUnread ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-900'
            }`}>
              {otherUser?.display_name || 'Usuario'}
            </h3>
            {thread.lastMessage ? (
              <p className="text-sm text-neutral-500 line-clamp-2">
                {thread.lastMessage.body}
              </p>
            ) : (
              <p className="text-xs text-neutral-400 italic">
                Sin mensajes aún
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {thread.lastMessage && (
              <p className="text-xs text-neutral-400 whitespace-nowrap">
                {new Date(thread.lastMessage.created_at).toLocaleDateString('es-MX', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}
            {isUnread && (
              <div className="h-2 w-2 rounded-full bg-brand" />
            )}
          </div>
        </div>
      </Link>

      {/* Link desktop: navega a /messages?thread={id} */}
      <Link
        href={`/messages?thread=${thread.id}`}
        className={`hidden lg:block px-4 py-3 hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30 focus:ring-offset-2 rounded-lg ${
          isSelected ? 'bg-brand/5' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          {otherUser?.avatar_url ? (
            <img
              src={otherUser.avatar_url}
              alt={otherUser.display_name || 'Usuario'}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center text-base font-semibold flex-shrink-0">
              {initial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm mb-0.5 truncate ${
              isUnread ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-900'
            }`}>
              {otherUser?.display_name || 'Usuario'}
            </h3>
            {thread.lastMessage ? (
              <p className="text-sm text-neutral-500 line-clamp-2">
                {thread.lastMessage.body}
              </p>
            ) : (
              <p className="text-xs text-neutral-400 italic">
                Sin mensajes aún
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {thread.lastMessage && (
              <p className="text-xs text-neutral-400 whitespace-nowrap">
                {new Date(thread.lastMessage.created_at).toLocaleDateString('es-MX', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}
            {isUnread && (
              <div className="h-2 w-2 rounded-full bg-brand" />
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  // Verificar que el usuario tenga perfil
  await requireProfileOrRedirect()

  const supabase = createServerSupabaseClient()

  // Obtener sesión para filtrar threads
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return null // requireProfileOrRedirect ya maneja redirect
  }

  // Obtener perfil del usuario actual
  const { data: currentProfile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', session.user.id)
    .single()

  if (!currentProfile || profileError) {
    return null // requireProfileOrRedirect ya maneja redirect
  }

  const currentProfileId = currentProfile.user_id

  // Leer thread seleccionado desde query param
  const selectedThreadId = searchParams?.thread ?? null

  // Obtener threads del usuario con datos relacionados en una sola query
  // Usamos RPC o construimos la query manualmente para optimizar
  const { data: rawThreads, error } = await supabase
    .from('threads')
    .select(`
      id, 
      user1_id, 
      user2_id, 
      listing_id, 
      created_at
    `)
    .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
    .order('created_at', { ascending: false })
    .limit(50)

  let threadsWithData: any[] = []

  if (rawThreads && rawThreads.length > 0) {
    // Extraer IDs únicos
    const threadIds = rawThreads.map((t) => t.id)
    const otherUserIds = rawThreads.map((t) =>
      t.user1_id === session.user.id ? t.user2_id : t.user1_id
    )

    // Batch fetch: perfiles de otros usuarios
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url, pets, smoker, cleanliness, parties, schedule')
      .in('user_id', otherUserIds)

    // Batch fetch: últimos mensajes por thread (subconsulta lateral)
    // Como Supabase no soporta LATERAL directamente, usamos un truco:
    // Obtener TODOS los mensajes de estos threads y luego filtrar en JS
    const { data: allMessages } = await supabase
      .from('messages')
      .select('thread_id, body, created_at, sender_id')
      .in('thread_id', threadIds)
      .order('created_at', { ascending: false })

    // Batch fetch: participantes
    const { data: participants } = await supabase
      .from('thread_participants')
      .select('thread_id, last_read_at')
      .in('thread_id', threadIds)
      .eq('profile_id', currentProfileId)

    // Crear maps para lookup O(1)
    const profilesMap = new Map(
      (profiles || []).map((p) => [p.user_id, p])
    )
    const participantsMap = new Map(
      (participants || []).map((p) => [p.thread_id, p])
    )

    // Agrupar mensajes por thread y tomar el más reciente
    const lastMessagesMap = new Map<string, any>()
    for (const msg of allMessages || []) {
      if (!lastMessagesMap.has(msg.thread_id)) {
        lastMessagesMap.set(msg.thread_id, msg)
      }
    }

    threadsWithData = rawThreads.map((thread) => {
      const otherUserId =
        thread.user1_id === session.user.id ? thread.user2_id : thread.user1_id
      const otherProfile = profilesMap.get(otherUserId) || null
      const lastMessage = lastMessagesMap.get(thread.id) || null
      const participant = participantsMap.get(thread.id)

      const lastReadAt = participant?.last_read_at
        ? new Date(participant.last_read_at)
        : null
      const lastMsgAt = lastMessage ? new Date(lastMessage.created_at) : null
      const isUnread =
        !!lastMsgAt &&
        !!lastMessage &&
        lastMessage.sender_id !== currentProfileId &&
        (!lastReadAt || lastMsgAt > lastReadAt)

      return {
        ...thread,
        otherUser: otherProfile,
        lastMessage,
        isUnread,
      }
    })
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 lg:h-[calc(100vh-220px)]">
        {/* Sidebar izquierdo */}
        <aside className="rounded-2xl border border-neutral-200 bg-white overflow-hidden h-full min-h-0 flex flex-col">
          <div className="px-4 py-3 border-b border-neutral-200 bg-white">
            <h1 className="text-xl font-semibold tracking-tight">Mensajes</h1>
            <p className="text-xs text-neutral-600 mt-1">Tus conversaciones privadas.</p>
            
            {/* Tools section: search + new button */}
            <div className="mt-3 flex items-center gap-2">
              <InboxSearch />
              <button
                type="button"
                disabled
                className="h-9 w-9 rounded-full border border-neutral-200 hover:bg-neutral-50 transition grid place-items-center disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Nuevo mensaje"
              >
                <span className="text-lg text-neutral-600">+</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg m-4">
              <p className="text-sm">Error al cargar mensajes: {error.message}</p>
            </div>
          )}

          {!rawThreads || rawThreads.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon="messages"
                title="Tu inbox está vacío"
                description="Cuando contactes a alguien, tus conversaciones aparecerán aquí."
                ctaLabel="Buscar roomies"
                ctaHref="/explore"
                variant="compact"
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="divide-y divide-neutral-100">
                {threadsWithData.map((thread) => (
                  <ThreadRow
                    key={thread.id}
                    thread={thread}
                    selectedThreadId={selectedThreadId}
                    isUnread={thread.isUnread}
                  />
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Panel derecho (solo desktop) */}
        <section className="hidden lg:flex rounded-2xl border border-neutral-200 bg-white overflow-hidden h-full min-h-0">
          {selectedThreadId ? (
            <ThreadPanel threadId={selectedThreadId} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-8 h-8 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <p className="text-lg font-medium text-neutral-900 mb-1">
                  Selecciona una conversación
                </p>
                <p className="text-sm text-neutral-500">
                  Elige una conversación de la lista para ver los mensajes
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

