'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signOut } from '@/lib/auth'
import { hasProfile } from './actions'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      const { data, error: signInError } = await signIn(email, password)

      if (signInError) {
        setErrorMsg(signInError.message)
        setLoading(false)
        return
      }

      // Verificar si el email está confirmado
      const user = data?.user
      if (!user?.email_confirmed_at) {
        // Si el email no está confirmado, hacer signOut y mostrar mensaje
        await signOut()
        setErrorMsg('Verifica tu correo antes de iniciar sesión.')
        setLoading(false)
        return
      }

      // Refrescar para sincronizar cookies/sesión antes de verificar perfil
      router.refresh()

      // Verificar si el usuario tiene perfil
      const profileExists = await hasProfile()

      // Redirigir según si tiene perfil o no
      if (!profileExists) {
        router.push('/onboarding/step-1')
      } else {
        router.push('/explore')
      }

      setLoading(false)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al iniciar sesión')
      setLoading(false)
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
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30"
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
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30"
            placeholder="Tu contraseña"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FF7A18] text-white px-6 py-3 rounded-lg hover:bg-[#E86F14] disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Entrando...' : 'Iniciar sesión'}
        </button>

        {errorMsg && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}
      </form>

      <div className="mt-4 text-center text-sm">
        <span>¿No tienes cuenta? </span>
        <a href="/signup" className="text-[#FF7A18] hover:underline">
          Regístrate
        </a>
      </div>
    </div>
  )
}
