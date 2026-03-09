'use client'

import { useState, FormEvent } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const supabase = createBrowserSupabaseClient()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setErrorMsg('')
    setIsSubmitting(true)

    try {
      const origin = window.location.origin
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`,
      })

      if (error) {
        setErrorMsg(error.message)
        return
      }

      setSent(true)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Ocurrió un error. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <h1 className="text-3xl font-bold mb-2">Recuperar contraseña</h1>
      <p className="text-neutral-500 mb-8 text-sm">
        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      {sent ? (
        <div className="p-5 bg-green-50 border border-green-200 rounded-xl text-center">
          <p className="text-green-800 font-medium mb-1">¡Correo enviado!</p>
          <p className="text-sm text-green-700">
            Revisa tu bandeja de entrada (y spam) para el enlace de recuperación.
          </p>
          <Link
            href="/login"
            className="inline-block mt-4 text-sm text-brand hover:underline"
          >
            Volver al login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-2 font-medium text-sm">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30"
              placeholder="tu@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand text-white px-6 py-3 rounded-lg hover:bg-brandHover disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 font-medium"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>

          {errorMsg && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          <div className="text-center text-sm">
            <Link href="/login" className="text-brand hover:underline">
              Volver al login
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
