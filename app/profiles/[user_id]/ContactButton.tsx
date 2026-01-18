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
    <form onSubmit={handleContact}>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#FF7A18] text-white px-6 py-3 rounded-lg hover:bg-[#E86F14] disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Abriendo chat...' : 'Contactar'}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
    </form>
  )
}

