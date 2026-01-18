import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireProfileOrRedirect } from '@/lib/requireProfile'
import Link from 'next/link'
import LifestyleBadges from '../components/LifestyleBadges'

export default async function MessagesPage() {
  // Verificar que el usuario tenga perfil
  await requireProfileOrRedirect()

  const supabase = createServerSupabaseClient()

  // Obtener sesión para filtrar threads
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return null // requireProfileOrRedirect ya maneja redirect
  }

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
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mensajes</h1>
        <p className="text-gray-600 text-sm">Tus conversaciones privadas.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6">
          Error al cargar mensajes: {error.message}
        </div>
      )}

      {!threads || threads.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Aún no tienes conversaciones
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Cuando contactes a alguien, tus chats aparecerán aquí.
          </p>
          <Link
            href="/explore"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Explorar perfiles
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {threadsWithData.map((thread) => {
            const otherUser = thread.otherUser
            const initial = otherUser?.display_name?.charAt(0).toUpperCase() || '?'

            return (
              <Link
                key={thread.id}
                href={`/messages/${thread.id}`}
                className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4">
                  {otherUser?.avatar_url ? (
                    <img
                      src={otherUser.avatar_url}
                      alt={otherUser.display_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-semibold">
                      {initial}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold mb-1">
                      {otherUser?.display_name || 'Usuario'}
                    </h2>
                    {otherUser && <LifestyleBadges profile={otherUser} />}
                    {thread.lastMessage ? (
                      <p className="text-gray-600 text-sm truncate mt-2">
                        {thread.lastMessage.body}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm italic mt-2">
                        Sin mensajes aún
                      </p>
                    )}
                  </div>
                  {thread.lastMessage && (
                    <p className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(thread.lastMessage.created_at).toLocaleDateString('es-MX')}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

