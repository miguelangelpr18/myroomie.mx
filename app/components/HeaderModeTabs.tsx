'use client'

import { useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'

interface HeaderModeTabsProps {
  userId?: string
  hasProfile?: boolean
}

export default function HeaderModeTabs({ userId, hasProfile }: HeaderModeTabsProps = {}) {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Detectar modo actual
  // Si hay query param mode, usarlo; si no, inferir desde pathname
  const modeParam = searchParams.get('mode')
  let currentMode: 'roomies' | 'listings' = 'roomies' // default
  
  if (modeParam === 'listings') {
    currentMode = 'listings'
  } else if (modeParam === 'roomies') {
    currentMode = 'roomies'
  } else {
    // Si no hay mode param, inferir desde pathname
    currentMode = pathname === '/listings' ? 'listings' : 'roomies'
  }

  // Helper para construir href preservando query params
  const buildHref = (nextMode: 'roomies' | 'listings') => {
    const params = new URLSearchParams()

    // Preservar todos los query params existentes excepto mode
    searchParams.forEach((value, key) => {
      if (key !== 'mode') {
        params.set(key, value)
      }
    })

    // Agregar el nuevo mode
    params.set('mode', nextMode)

    // Determinar base path según el modo
    const basePath = nextMode === 'listings' ? '/listings' : '/explore'

    const queryString = params.toString()
    return queryString ? `${basePath}?${queryString}` : basePath
  }

  // Determinar si estamos en una página relevante para mostrar tabs
  const isRelevantPage = pathname === '/explore' || pathname === '/listings'

  // Si no estamos en una página relevante, no mostrar tabs
  if (!isRelevantPage) {
    return null
  }

  return (
    <div className="flex items-center gap-4">
      {/* Tabs */}
      <div className="flex items-center bg-gray-100 rounded-lg p-1">
        <Link
          href={buildHref('roomies')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentMode === 'roomies'
              ? 'bg-[#FF7A18] text-white'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          Roomies
        </Link>
        <Link
          href={buildHref('listings')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentMode === 'listings'
              ? 'bg-[#FF7A18] text-white'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          Listings
        </Link>
      </div>

      {/* CTA contextual */}
      {currentMode === 'listings' ? (
        <Link
          href="/listings/new"
          className="bg-[#FF7A18] text-white px-4 py-2 rounded-lg hover:bg-[#E86F14] text-sm font-medium whitespace-nowrap"
        >
          Crear listing
        </Link>
      ) : (
        <Link
          href={hasProfile && userId ? `/profiles/${userId}` : '/onboarding/step-1'}
          className="bg-[#FF7A18] text-white px-4 py-2 rounded-lg hover:bg-[#E86F14] text-sm font-medium whitespace-nowrap"
        >
          {hasProfile && userId ? 'Ver mi perfil' : 'Crear perfil roomie'}
        </Link>
      )}
    </div>
  )
}

