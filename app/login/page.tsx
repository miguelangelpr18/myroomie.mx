'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signOut } from '@/lib/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: signInError } = await signIn(email, password)

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      // Verificar si el email está confirmado
      const user = data?.user
      if (!user?.email_confirmed_at) {
        // Si el email no está confirmado, hacer signOut y mostrar mensaje
        await signOut()
        setError('Verifica tu correo antes de iniciar sesión.')
        setLoading(false)
        return
      }

      // Si el email está confirmado, redirigir a /app
      router.push('/app')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
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
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tu contraseña"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        <span>¿No tienes cuenta? </span>
        <a href="/signup" className="text-blue-600 hover:underline">
          Regístrate
        </a>
      </div>
    </div>
  )
}
