'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PromoteButtonProps {
  onActivate: () => Promise<{ error: string | null }>
}

export default function PromoteButton({ onActivate }: PromoteButtonProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()

  const handleClick = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await onActivate()

      if (error) {
        setMessage({ type: 'error', text: error })
      } else {
        setMessage({ type: 'success', text: 'Promoción activada' })
        router.refresh()
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al activar promoción',
      })
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(null), 5000)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full bg-brand text-white px-6 py-3 rounded-lg hover:bg-brandHover font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Activando...' : 'Promocionar ahora'}
      </button>
      {message && (
        <div
          className={`mt-3 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}
