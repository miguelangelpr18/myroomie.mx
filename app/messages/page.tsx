import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireProfileOrRedirect } from '@/lib/requireProfile'
import Link from 'next/link'
import LifestyleBadges from '../components/LifestyleBadges'
import EmptyState from '../components/ui/EmptyState'
import ThreadPanel from './ThreadPanel'

interface MessagesPageProps {
  searchParams?: { thread?: string }
}

// Componente interno para cada fila de thread
function ThreadRow({
  thread,
  selectedThreadId,
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
    lastMessage: { body: string; created_at: string } | null
  }
  selectedThreadId: string | null
}) {
  const otherUser = thread.otherUser
  const initial = otherUser?.display_name?.charAt(0).toUpperCase() || '?'
  const isSelected = thread.id === selectedThreadId

  return (
    <div className="relative">
      {/* Barra izquierda naranja cuando está seleccionado (desktop) */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF7A18] rounded-r-full hidden lg:block" />
      )}
      
      {/* Link mobile: navega a /messages/[id] */}
      <Link
        href={`/messages/${thread.id}`}
        className={`lg:hidden block px-4 py-3 hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30 focus:ring-offset-2 rounded-lg ${
          isSelected ? 'bg-orange-50' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          {otherUser?.avatar_url ? (
            <img
              src={otherUser.avatar_url}
              alt={otherUser.display_name || 'Usuario'}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#FF7A18] text-white flex items-center justify-center text-lg font-semibold flex-shrink-0">
              {initial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm mb-0.5 truncate">
              {otherUser?.display_name || 'Usuario'}
            </h3>
            {otherUser && (
              <div className="mb-1">
                <LifestyleBadges profile={otherUser} />
              </div>
            )}
            {thread.lastMessage ? (
              <p className="text-xs text-neutral-600 truncate">
                {thread.lastMessage.body}
              </p>
            ) : (
              <p className="text-xs text-neutral-400 italic">
                Sin mensajes aún
              </p>
            )}
          </div>
          {thread.lastMessage && (
            <p className="text-xs text-neutral-500 whitespace-nowrap flex-shrink-0">
              {new Date(thread.lastMessage.created_at).toLocaleDateString('es-MX', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
      </Link>

      {/* Link desktop: navega a /messages?thread={id} */}
      <Link
        href={`/messages?thread=${thread.id}`}
        className={`hidden lg:block px-4 py-3 hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30 focus:ring-offset-2 rounded-lg ${
          isSelected ? 'bg-orange-50' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          {otherUser?.avatar_url ? (
            <img
              src={otherUser.avatar_url}
              alt={otherUser.display_name || 'Usuario'}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#FF7A18] text-white flex items-center justify-center text-lg font-semibold flex-shrink-0">
              {initial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm mb-0.5 truncate">
              {otherUser?.display_name || 'Usuario'}
            </h3>
            {otherUser && (
              <div className="mb-1">
                <LifestyleBadges profile={otherUser} />
              </div>
            )}
            {thread.lastMessage ? (
              <p className="text-xs text-neutral-600 truncate">
                {thread.lastMessage.body}
              </p>
            ) : (
              <p className="text-xs text-neutral-400 italic">
                Sin mensajes aún
              </p>
            )}
          </div>
          {thread.lastMessage && (
            <p className="text-xs text-neutral-500 whitespace-nowrap flex-shrink-0">
              {new Date(thread.lastMessage.created_at).toLocaleDateString('es-MX', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          )}
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

  // Leer thread seleccionado desde query param
  const selectedThreadId = searchParams?.thread ?? null

  // Obtener threads del usuario (donde es user1_id o user2_id)
  const { data: threads, error } = await supabase
    .from('threads')
    .select('id, user1_id, user2_id, listing_id, created_at')
    .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
    .order('created_at', { ascending: false })
    .limit(50)

  // Obtener último mensaje de cada thread y perfil del otro usuario
  const threadsWithData = await Promise.all(
    (threads || []).map(async (thread) => {
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

      // Obtener último mensaje
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('body, created_at')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      return {
        ...thread,
        otherUser: otherProfile,
        lastMessage: lastMessage || null,
      }
    })
  )

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 lg:h-[calc(100vh-220px)]">
        {/* Sidebar izquierdo */}
        <aside className="rounded-2xl border border-neutral-200 bg-white overflow-hidden h-full min-h-0 flex flex-col">
          <div className="p-4 border-b border-neutral-200">
            <h1 className="text-xl font-semibold tracking-tight">Mensajes</h1>
            <p className="text-xs text-neutral-600 mt-1">Tus conversaciones privadas.</p>
          </div>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg m-4">
              <p className="text-sm">Error al cargar mensajes: {error.message}</p>
            </div>
          )}

          {!threads || threads.length === 0 ? (
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

