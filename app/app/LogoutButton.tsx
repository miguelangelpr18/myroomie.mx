'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      // Incluso si hay error, redirigir a login
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {loading ? 'Cerrando sesión...' : 'Logout'}
    </button>
  )
}

