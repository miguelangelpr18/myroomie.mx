'use client'

import { useRouter } from 'next/navigation'
import { logout } from '@/app/logout/actions'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      // Usar server action para borrar cookies SSR
      const { error } = await logout()
      
      if (error) {
        console.error('Error al cerrar sesión:', error)
        // Incluso si hay error, intentar redirigir y refrescar
      }
      
      // Redirigir y refrescar para actualizar el Header (Server Component)
      router.replace('/login')
      router.refresh()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      // Incluso si hay error, redirigir y refrescar
      router.replace('/login')
      router.refresh()
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
      {loading ? 'Saliendo...' : 'Logout'}
    </button>
  )
}

