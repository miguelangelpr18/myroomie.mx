'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Avatar from '../components/ui/Avatar'

interface ThreadData {
  id: string
  otherUser: {
    display_name: string | null
    avatar_url: string | null
  } | null
  lastMessage: { body: string; created_at: string; sender_id: string } | null
  isUnread: boolean
}

interface ThreadListProps {
  threads: ThreadData[]
  selectedThreadId: string | null
}

function ThreadRow({
  thread,
  selectedThreadId,
}: {
  thread: ThreadData
  selectedThreadId: string | null
}) {
  const otherUser = thread.otherUser
  const initial = otherUser?.display_name?.charAt(0).toUpperCase() || '?'
  const isSelected = thread.id === selectedThreadId

  const rowContent = (
    <div className="flex items-center gap-3">
      <Avatar
        src={otherUser?.avatar_url}
        alt={otherUser?.display_name || 'Usuario'}
        size="md"
        initial={initial}
      />
      <div className="flex-1 min-w-0">
        <h3
          className={`text-sm mb-0.5 truncate ${
            thread.isUnread
              ? 'font-semibold text-neutral-900'
              : 'font-medium text-neutral-900'
          }`}
        >
          {otherUser?.display_name || 'Usuario'}
        </h3>
        {thread.lastMessage ? (
          <p className="text-sm text-neutral-500 line-clamp-1">
            {thread.lastMessage.body}
          </p>
        ) : (
          <p className="text-xs text-neutral-400 italic">Sin mensajes aún</p>
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
        {thread.isUnread && <div className="h-2 w-2 rounded-full bg-brand" />}
      </div>
    </div>
  )

  const linkClass = `block px-4 py-3 hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30 focus:ring-offset-2 rounded-lg ${
    isSelected ? 'bg-brand/5' : ''
  }`

  return (
    <div className="relative">
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand rounded-r-full hidden lg:block" />
      )}
      <Link href={`/messages/${thread.id}`} className={`lg:hidden ${linkClass}`}>
        {rowContent}
      </Link>
      <Link href={`/messages?thread=${thread.id}`} className={`hidden lg:block ${linkClass}`}>
        {rowContent}
      </Link>
    </div>
  )
}

export default function ThreadList({ threads, selectedThreadId }: ThreadListProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return threads
    return threads.filter((t) =>
      t.otherUser?.display_name?.toLowerCase().includes(q) ||
      t.lastMessage?.body?.toLowerCase().includes(q)
    )
  }, [search, threads])

  return (
    <>
      <div className="px-4 py-3 border-b border-neutral-200 bg-white">
        <h1 className="text-xl font-semibold tracking-tight">Mensajes</h1>
        <p className="text-xs text-neutral-600 mt-1">Tus conversaciones privadas.</p>
        <div className="mt-3">
          <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm focus-within:ring-2 focus-within:ring-brand/20">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversación..."
              className="w-full bg-transparent outline-none placeholder:text-neutral-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-neutral-400 hover:text-neutral-600 flex-shrink-0"
                aria-label="Limpiar búsqueda"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-6 text-center text-neutral-400 text-sm">
          {search ? 'Sin resultados' : 'No hay conversaciones'}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="divide-y divide-neutral-100">
            {filtered.map((thread) => (
              <ThreadRow
                key={thread.id}
                thread={thread}
                selectedThreadId={selectedThreadId}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
