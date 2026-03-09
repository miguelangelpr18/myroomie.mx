'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, signOut } from '@/lib/auth'
import { hasProfile } from './actions'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setErrorMsg('')
    try {
      const supabase = createBrowserSupabaseClient()
      const origin = window.location.origin
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      })
      if (error) {
        setErrorMsg(error.message)
        setGoogleLoading(false)
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al iniciar con Google.')
      setGoogleLoading(false)
    }
  }

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
      <h1 className="text-3xl font-bold mb-2">Iniciar sesión</h1>
      <p className="text-sm text-neutral-500 mb-6">Bienvenido de vuelta a MyRoomie.mx</p>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading || isSubmitting}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-60 mb-4"
      >
        {googleLoading ? (
          <svg className="animate-spin h-4 w-4 text-neutral-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        {googleLoading ? 'Conectando...' : 'Continuar con Google'}
      </button>

      <div className="relative flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-neutral-200" />
        <span className="text-xs text-neutral-400 font-medium">o con correo</span>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>

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
