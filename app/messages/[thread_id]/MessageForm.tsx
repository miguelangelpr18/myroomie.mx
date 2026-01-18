'use client'

import { useState, FormEvent } from 'react'
import { sendMessage } from '../actions'

interface MessageFormProps {
  threadId: string
}

export default function MessageForm({ threadId }: MessageFormProps) {
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
      
      // Recargar página para mostrar nuevo mensaje
      window.location.reload()
    } catch (err) {
      setErrorMsg('No se pudo completar la acción. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="flex gap-2">
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
          rows={3}
          maxLength={5000}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="bg-[#FF7A18] text-white px-6 py-2 rounded-lg hover:bg-[#E86F14] disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
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

