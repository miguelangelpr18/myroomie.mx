'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { findOrCreateThread } from '@/app/messages/actions'

interface ContactButtonProps {
  userId: string
}

export default function ContactButton({ userId }: ContactButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleContact = async (e: FormEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevenir que el click en el botón navegue a /profiles/[user_id]
    setError('')
    setLoading(true)

    try {
      const { data: threadId, error: threadError } = await findOrCreateThread(
        userId,
        null
      )

      if (threadError || !threadId) {
        setError('No se pudo completar la acción. Intenta de nuevo.')
        setLoading(false)
        return
      }

      // Redirigir al thread
      router.push(`/messages/${threadId}`)
    } catch (err) {
      setError('No se pudo completar la acción. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleContact} onClick={(e) => e.stopPropagation()}>
      <button
        type="submit"
        disabled={loading}
        className="bg-brand text-white px-4 py-2 rounded-lg hover:bg-brandHover disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
      >
        {loading ? 'Abriendo chat...' : 'Contactar'}
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </form>
  )
}

