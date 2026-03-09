'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    if (password !== confirm) {
      setErrorMsg('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 8) {
      setErrorMsg('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setErrorMsg('')
    setIsSubmitting(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setErrorMsg(error.message)
        return
      }
      router.push('/dashboard')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Ocurrió un error. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!ready) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <p className="text-neutral-500 text-sm">Verificando enlace de recuperación...</p>
        <p className="text-xs text-neutral-400 mt-2">
          Si esta página no carga, puede que el enlace haya expirado.{' '}
          <Link href="/forgot-password" className="text-brand hover:underline">
            Solicitar uno nuevo
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <h1 className="text-3xl font-bold mb-2">Nueva contraseña</h1>
      <p className="text-neutral-500 mb-8 text-sm">
        Elige una contraseña segura de al menos 8 caracteres.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block mb-2 font-medium text-sm">
            Nueva contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block mb-2 font-medium text-sm">
            Confirmar contraseña
          </label>
          <input
            type="password"
            id="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30"
            placeholder="Repite tu nueva contraseña"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand text-white px-6 py-3 rounded-lg hover:bg-brandHover disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 font-medium"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar nueva contraseña'}
        </button>

        {errorMsg && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}
      </form>
    </div>
  )
}
