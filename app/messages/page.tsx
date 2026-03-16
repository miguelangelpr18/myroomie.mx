import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireProfileOrRedirect } from '@/lib/requireProfile'
import EmptyState from '../components/ui/EmptyState'
import ThreadPanel from './ThreadPanel'
import ThreadList from './ThreadList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mensajes',
}

interface MessagesPageProps {
  searchParams?: { thread?: string }
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const { user } = await requireProfileOrRedirect()

  const supabase = createServerSupabaseClient()

  const { data: currentProfile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .single()

  if (!currentProfile || profileError) {
    return null
  }

  const currentProfileId = currentProfile.user_id
  const selectedThreadId = searchParams?.thread ?? null

  const { data: rawThreads, error } = await supabase
    .from('threads')
    .select('id, user1_id, user2_id, listing_id, created_at')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(50)

  let threadsWithData: {
    id: string
    otherUser: { display_name: string | null; avatar_url: string | null } | null
    lastMessage: { body: string; created_at: string; sender_id: string } | null
    isUnread: boolean
  }[] = []

  if (rawThreads && rawThreads.length > 0) {
    const threadIds = rawThreads.map((t) => t.id)
    const otherUserIds = rawThreads.map((t) =>
      t.user1_id === user.id ? t.user2_id : t.user1_id
    )

    const [profilesRes, messagesRes, participantsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', otherUserIds),
      supabase
        .from('messages')
        .select('thread_id, body, created_at, sender_id')
        .in('thread_id', threadIds)
        .order('created_at', { ascending: false }),
      supabase
        .from('thread_participants')
        .select('thread_id, last_read_at')
        .in('thread_id', threadIds)
        .eq('profile_id', currentProfileId),
    ])

    const profilesMap = new Map(
      (profilesRes.data || []).map((p) => [p.user_id, p])
    )
    const participantsMap = new Map(
      (participantsRes.data || []).map((p) => [p.thread_id, p])
    )
    const lastMessagesMap = new Map<string, { body: string; created_at: string; sender_id: string }>()
    for (const msg of messagesRes.data || []) {
      if (!lastMessagesMap.has(msg.thread_id)) {
        lastMessagesMap.set(msg.thread_id, msg)
      }
    }

    threadsWithData = rawThreads.map((thread) => {
      const otherUserId = thread.user1_id === user.id ? thread.user2_id : thread.user1_id
      const otherProfile = profilesMap.get(otherUserId) || null
      const lastMessage = lastMessagesMap.get(thread.id) || null
      const participant = participantsMap.get(thread.id)

      const lastReadAt = participant?.last_read_at ? new Date(participant.last_read_at) : null
      const lastMsgAt = lastMessage ? new Date(lastMessage.created_at) : null
      const isUnread =
        !!lastMsgAt &&
        !!lastMessage &&
        lastMessage.sender_id !== currentProfileId &&
        (!lastReadAt || lastMsgAt > lastReadAt)

      return {
        id: thread.id,
        otherUser: otherProfile,
        lastMessage,
        isUnread,
      }
    })
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 lg:h-[calc(100vh-220px)]">
        <aside className="rounded-2xl border border-neutral-200 bg-white overflow-hidden h-full min-h-0 flex flex-col">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg m-4 text-sm">
              Error al cargar los mensajes. Intenta de nuevo.
            </div>
          )}

          {!rawThreads || rawThreads.length === 0 ? (
            <div className="p-4 flex-1 flex items-center">
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
            <ThreadList threads={threadsWithData} selectedThreadId={selectedThreadId} />
          )}
        </aside>

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
