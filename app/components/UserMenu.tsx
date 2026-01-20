'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logout } from '@/app/logout/actions'

interface UserMenuProps {
  displayName: string
  avatarUrl: string | null
  userId: string
  initial: string
}

export default function UserMenu({ displayName, avatarUrl, userId, initial }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = async () => {
    setLoading(true)
    try {
      const { error } = await logout()
      if (error) {
        console.error('Error al cerrar sesión:', error)
      }
      router.replace('/login')
      router.refresh()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      router.replace('/login')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#FF7A18] text-white flex items-center justify-center text-sm font-semibold">
            {initial}
          </div>
        )}
        <span className="text-sm font-medium hidden md:inline">{displayName}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Dashboard
          </Link>
          <Link
            href="/messages"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Inbox
          </Link>
          <Link
            href="/shortlist"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Shortlist
          </Link>
          <Link
            href="/matches"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Matches
          </Link>
          <Link
            href="/account"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Account
          </Link>
          <div className="border-t border-gray-200 my-1"></div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saliendo...' : 'Log out'}
          </button>
        </div>
      )}
    </div>
  )
}

