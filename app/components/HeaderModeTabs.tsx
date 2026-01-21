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
    <div className="flex items-center gap-3">
      {/* Tabs */}
      <div className="inline-flex items-center rounded-xl border border-neutral-200 bg-neutral-50 p-1">
        <Link
          href={buildHref('roomies')}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            currentMode === 'roomies'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Roomies
        </Link>
        <Link
          href={buildHref('listings')}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            currentMode === 'listings'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Listings
        </Link>
      </div>

      {/* CTA contextual */}
      {currentMode === 'listings' ? (
        <Link
          href="/listings/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-brand px-4 text-sm font-medium text-white hover:bg-brandHover transition-colors whitespace-nowrap"
        >
          Crear listing
        </Link>
      ) : (
        <Link
          href={hasProfile && userId ? `/profiles/${userId}` : '/onboarding/step-1'}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-brand px-4 text-sm font-medium text-white hover:bg-brandHover transition-colors whitespace-nowrap"
        >
          {hasProfile && userId ? 'Ver mi perfil' : 'Crear perfil roomie'}
        </Link>
      )}
    </div>
  )
}

