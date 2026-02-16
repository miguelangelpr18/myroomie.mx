'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { sendMessage } from '../actions'

interface MessageFormProps {
  threadId: string
}

export default function MessageForm({ threadId }: MessageFormProps) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    
    if (!message.trim()) {
      setErrorMsg('El mensaje no puede estar vacío.')
      return
    }

    setLoading(true)

    try {
      const { error } = await sendMessage(threadId, message)
      
      if (error) {
        setErrorMsg('No se pudo completar la acción. Intenta de nuevo.')
        setLoading(false)
        return
      }

      // Limpiar input si éxito
      setMessage('')
      setLoading(false)
      
      // Refrescar datos del servidor para mostrar nuevo mensaje
      router.refresh()
    } catch (err) {
      setErrorMsg('No se pudo completar la acción. Intenta de nuevo.')
      setLoading(false)
    }
  }

  const hasText = message.trim().length > 0
  const isDisabled = loading || !hasText

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-3 items-end">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
          placeholder="Escribe un mensaje..."
          rows={2}
          maxLength={5000}
          className="flex-1 resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={isDisabled}
          className={`h-12 px-5 rounded-2xl font-medium transition whitespace-nowrap ${
            isDisabled
              ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
              : 'bg-brand text-white hover:opacity-90'
          }`}
          aria-label={loading ? 'Enviando mensaje...' : 'Enviar mensaje'}
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
      {errorMsg && (
        <p className="mt-2 text-sm text-red-600">{errorMsg}</p>
      )}
    </form>
  )
}

