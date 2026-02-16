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
            className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-200 hover:ring-neutral-300 transition"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold ring-1 ring-neutral-200 hover:ring-neutral-300 transition">
            {initial}
          </div>
        )}
        <span className="text-sm font-medium hidden md:inline">{displayName}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg z-50">
          <div className="flex flex-col gap-1">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/messages"
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition"
            >
              Inbox
            </Link>
            <Link
              href="/shortlist"
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition"
            >
              Shortlist
            </Link>
            <Link
              href="/matches"
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition"
            >
              Matches
            </Link>
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition"
            >
              Account
            </Link>
            <div className="my-1 border-t border-neutral-200"></div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full text-left rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saliendo...' : 'Log out'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


