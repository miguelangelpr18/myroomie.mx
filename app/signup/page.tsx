'use client'

import { useState, FormEvent } from 'react'
import { signUp } from '@/lib/auth'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres'
    }
    if (!/[A-Z]/.test(password)) {
      return 'La contraseña debe tener al menos una mayúscula'
    }
    if (!/[0-9]/.test(password)) {
      return 'La contraseña debe tener al menos un número'
    }
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validaciones
    if (!validateEmail(email)) {
      setError('Email inválido')
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (!acceptTerms) {
      setError('Debes aceptar los Términos y Privacidad')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await signUp(email, password)

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Cuenta creada. Revisa tu correo para verificar tu email.')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setAcceptTerms(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <h1 className="text-3xl font-bold mb-6">Crear perfil</h1>

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
            placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 número"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block mb-2 font-medium">
            Confirmar contraseña
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Repite tu contraseña"
          />
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            required
            className="mt-1 mr-2"
          />
          <label htmlFor="acceptTerms" className="text-sm">
            Acepto los{' '}
            <a href="/legal/terms" className="text-blue-600 hover:underline">
              Términos y Condiciones
            </a>{' '}
            y la{' '}
            <a href="/legal/privacy" className="text-blue-600 hover:underline">
              Política de Privacidad
            </a>
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  )
}
