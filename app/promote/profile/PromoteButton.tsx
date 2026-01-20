'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { activateProfilePromotion } from './actions'

interface PromoteButtonProps {
  planName: string
  planDays: number
}

export default function PromoteButton({ planName, planDays }: PromoteButtonProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()

  const handleClick = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await activateProfilePromotion(planDays)

      if (error) {
        setMessage({ type: 'error', text: error })
      } else {
        setMessage({ type: 'success', text: 'Promoción activada' })
        // Refrescar para actualizar UI
        router.refresh()
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al activar promoción',
      })
    } finally {
      setLoading(false)
      // Ocultar mensaje después de 5 segundos
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full bg-[#FF7A18] text-white px-6 py-3 rounded-lg hover:bg-[#E86F14] font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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

