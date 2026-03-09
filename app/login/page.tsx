'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, signOut } from '@/lib/auth'
import { hasProfile } from './actions'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Leer intent y next de query params
  const intentParam = searchParams.get('intent')
  const intent = intentParam === 'listings' || intentParam === 'roomies' ? intentParam : null
  const nextParam = searchParams.get('next') || searchParams.get('redirectTo') || null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    // Prevenir múltiples submits
    if (isSubmitting) return
    
    setErrorMsg('')
    setIsSubmitting(true)

    try {
      const { data, error: signInError } = await signIn(email, password)

      if (signInError) {
        setErrorMsg(signInError.message)
        return
      }

      // Verificar si el email está confirmado
      const user = data?.user
      if (!user?.email_confirmed_at) {
        // Si el email no está confirmado, hacer signOut y mostrar mensaje
        await signOut()
        setErrorMsg('Verifica tu correo antes de iniciar sesión.')
        return
      }

      // Refrescar para sincronizar cookies/sesión antes de verificar perfil
      router.refresh()

      // Verificar si el usuario tiene perfil
      const profileExists = await hasProfile()

      // Redirigir según si tiene perfil, el intent y el next param
      // Si existe next param, tiene prioridad (para rutas protegidas)
      if (nextParam) {
        router.push(nextParam)
        return
      }

      // Sin next param, redirigir según si tiene perfil y el intent
      if (!profileExists) {
        // Sin perfil
        if (intent === 'listings') {
          router.push('/listings/new')
        } else if (intent === 'roomies') {
          router.push('/onboarding/step-1')
        } else {
          // intent === null
          router.push('/signup/intent')
        }
      } else {
        // Con perfil
        if (intent === 'listings') {
          router.push('/listings')
        } else {
          // intent === 'roomies' o null - redirigir a home
          router.push('/')
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <h1 className="text-3xl font-bold mb-6">Login</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-2 font-medium">
            Email
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

        <div>
          <label htmlFor="password" className="block mb-2 font-medium">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30"
            placeholder="Tu contraseña"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand text-white px-6 py-3 rounded-lg hover:bg-brandHover disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Entrando...' : 'Iniciar sesión'}
        </button>

        {errorMsg && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}
      </form>

      <div className="mt-4 text-center text-sm">
        <span>¿No tienes cuenta? </span>
        <a href="/signup" className="text-brand hover:underline">
          Regístrate
        </a>
      </div>

      <div className="mt-3 text-center">
        <a href="/forgot-password" className="text-sm text-brand hover:underline">
          ¿Olvidaste tu contraseña?
        </a>
      </div>
    </div>
  )
}
