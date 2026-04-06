'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { clearLocationPersistence, clearLocationFromUrlParams } from '@/app/lib/search/clearLocation'
import SearchInput from './SearchInput'
import LocationPicker from './LocationPicker'
import { ListingsFilters, RoomiesFilters } from './FilterPopovers'
import { listingsFiltersSchema, roomiesFiltersSchema } from './validation'

interface GlobalSearchBarProps {
  mode?: 'listings' | 'roomies'
}

export default function GlobalSearchBar({ mode: propMode }: GlobalSearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Determinar mode según pathname si no se pasa como prop
  const mode = propMode || (pathname?.startsWith('/explore') ? 'roomies' : 'listings')
  const targetPath = mode === 'roomies' ? '/explore' : '/listings'

  // Estado local de filtros según mode
  const [filters, setFilters] = useState<any>(() => {
    if (mode === 'roomies') {
      return {
        q: searchParams.get('q') || '',
        city: searchParams.get('city') || '',
        budget_min: searchParams.get('budget_min') || '',
        budget_max: searchParams.get('budget_max') || '',
      }
    } else {
      return {
        q: searchParams.get('q') || '',
        city: searchParams.get('city') || '',
        zone: searchParams.get('zone') || '',
        listing_type: searchParams.get('listing_type') || 'all',
        min: searchParams.get('min') || '',
        max: searchParams.get('max') || '',
        sort: searchParams.get('sort') || 'recent',
      }
    }
  })

  const cityQuery = (filters.city || '').trim()

  // Sincronizar con URL params cuando cambian
  useEffect(() => {
    const currentMode = propMode || (pathname?.startsWith('/explore') ? 'roomies' : 'listings')
    if (currentMode === 'roomies') {
      setFilters({
        q: searchParams.get('q') || '',
        city: searchParams.get('city') || '',
        budget_min: searchParams.get('budget_min') || '',
        budget_max: searchParams.get('budget_max') || '',
      })
    } else {
      setFilters({
        q: searchParams.get('q') || '',
        city: searchParams.get('city') || '',
        zone: searchParams.get('zone') || '',
        listing_type: searchParams.get('listing_type') || 'all',
        min: searchParams.get('min') || '',
        max: searchParams.get('max') || '',
        sort: searchParams.get('sort') || 'recent',
      })
    }
    setSelectedLocationId(searchParams.get('location_id') || null)
  }, [searchParams, pathname, propMode])

  // Cerrar con click afuera / ESC y prevenir scroll cuando está abierto
  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target) return

      const insideDropdown = dropdownRef.current?.contains(target) ?? false
      const insideTrigger = triggerRef.current?.contains(target) ?? false

      if (!insideDropdown && !insideTrigger) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSearch = () => {
    setValidationError(null)

    // Validar con Zod según el mode
    if (mode === 'roomies') {
      const result = roomiesFiltersSchema.safeParse(filters)
      if (!result.success) {
        setValidationError(result.error.issues[0]?.message || 'Error de validación')
        return
      }
    } else {
      const result = listingsFiltersSchema.safeParse(filters)
      if (!result.success) {
        setValidationError(result.error.issues[0]?.message || 'Error de validación')
        return
      }
    }

    const params = new URLSearchParams()

    if (mode === 'roomies') {
      if ((filters.q ?? '').trim()) params.set('q', (filters.q ?? '').trim())
      if (selectedLocationId) {
        params.set('location_id', selectedLocationId)
      } else if ((filters.city ?? '').trim()) {
        params.set('city', (filters.city ?? '').trim())
      }
      if ((filters.budget_min ?? '').trim()) params.set('budget_min', (filters.budget_min ?? '').trim())
      if ((filters.budget_max ?? '').trim()) params.set('budget_max', (filters.budget_max ?? '').trim())
    } else {
      if ((filters.q ?? '').trim()) params.set('q', (filters.q ?? '').trim())
      if (selectedLocationId) {
        params.set('location_id', selectedLocationId)
      } else if ((filters.city ?? '').trim()) {
        params.set('city', (filters.city ?? '').trim())
      }
      if ((filters.zone ?? '').trim()) params.set('zone', (filters.zone ?? '').trim())
      if (filters.listing_type !== 'all') params.set('listing_type', filters.listing_type)
      if ((filters.min ?? '').trim()) params.set('min', (filters.min ?? '').trim())
      if ((filters.max ?? '').trim()) params.set('max', (filters.max ?? '').trim())
      if (filters.sort !== 'recent') params.set('sort', filters.sort)
    }

    router.push(`${targetPath}?${params.toString()}`)
    setIsOpen(false)
  }

  const clearLocationFromUIAndPersistence = () => {
    setFilters((prev: any) => ({ ...prev, city: '' }))
    setSelectedLocationId(null)
    setValidationError(null)
    clearLocationPersistence()

    const cleanedParams = clearLocationFromUrlParams(searchParams.toString())
    const nextUrl = cleanedParams ? `${pathname}?${cleanedParams}` : pathname
    router.push(nextUrl)
  }

  // Escuchar evento de limpieza de ubicación desde LogoLink
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleClearLocationEvent = () => {
      clearLocationFromUIAndPersistence()
    }

    window.addEventListener('myroomie:clear-location', handleClearLocationEvent)

    return () => {
      window.removeEventListener('myroomie:clear-location', handleClearLocationEvent)
    }
  }, [])

  const handleClear = () => {
    if (mode === 'roomies') {
      setFilters({
        q: '',
        city: '',
        budget_min: '',
        budget_max: '',
      })
    } else {
      setFilters({
        q: '',
        city: '',
        zone: '',
        listing_type: 'all',
        min: '',
        max: '',
        sort: 'recent',
      })
    }
    setSelectedLocationId(null)
    setValidationError(null)

    if (typeof window !== 'undefined') {
      localStorage.removeItem('last_location_id')
      localStorage.removeItem('last_location_label')
      localStorage.removeItem('last_location_zone')
      localStorage.removeItem('last_city_label')
      localStorage.removeItem('last_city_value')
    }

    router.push(pathname || targetPath)
    setIsOpen(false)
  }

  // Contar filtros activos
  const activeFiltersCount = mode === 'roomies'
    ? [
        (filters.q ?? '').trim(),
        (filters.city ?? '').trim(),
        (filters.budget_min ?? '').trim(),
        (filters.budget_max ?? '').trim(),
      ].filter(Boolean).length
    : [
        (filters.q ?? '').trim(),
        (filters.city ?? '').trim(),
        (filters.zone ?? '').trim(),
        filters.listing_type !== 'all',
        (filters.min ?? '').trim(),
        (filters.max ?? '').trim(),
        filters.sort !== 'recent',
      ].filter(Boolean).length

  // Manejar selección de ciudad
  const handleSelectCity = async (label: string, value: string, locationId?: string, zone?: string) => {
    const zoneTrimmed = (zone != null ? String(zone).trim() : (filters.zone ?? '').trim()) || ''
    setFilters({ ...filters, city: locationId ? label : value, zone: zoneTrimmed })
    setSelectedLocationId(locationId || null)
    setValidationError(null)

    const params = new URLSearchParams()
    if (mode === 'roomies') {
      if ((filters.q ?? '').trim()) params.set('q', (filters.q ?? '').trim())
      if (locationId) {
        params.set('location_id', locationId)
        params.set('city', value)
        if (zoneTrimmed.length >= 2) params.set('zone', zoneTrimmed)
      } else {
        params.set('city', value)
      }
      if ((filters.budget_min ?? '').trim()) params.set('budget_min', (filters.budget_min ?? '').trim())
      if ((filters.budget_max ?? '').trim()) params.set('budget_max', (filters.budget_max ?? '').trim())
    } else {
      if ((filters.q ?? '').trim()) params.set('q', (filters.q ?? '').trim())
      if (locationId) {
        params.set('location_id', locationId)
        params.set('city', value)
        if (zoneTrimmed.length >= 2) params.set('zone', zoneTrimmed)
      } else {
        params.set('city', value)
      }
      if (zoneTrimmed.length >= 2) params.set('zone', zoneTrimmed)
      if (filters.listing_type !== 'all') params.set('listing_type', filters.listing_type)
      if ((filters.min ?? '').trim()) params.set('min', (filters.min ?? '').trim())
      if ((filters.max ?? '').trim()) params.set('max', (filters.max ?? '').trim())
      if (filters.sort !== 'recent') params.set('sort', filters.sort)
    }

    if (typeof window !== 'undefined') {
      if (locationId) {
        localStorage.setItem('last_location_id', locationId)
        localStorage.setItem('last_location_label', label)
        if (zoneTrimmed) localStorage.setItem('last_location_zone', zoneTrimmed)
      } else {
        localStorage.setItem('last_city_label', label)
        localStorage.setItem('last_city_value', value)
      }
    }

    router.push(`${targetPath}?${params.toString()}`)
    setIsOpen(false)
  }

  // Texto resumen para estado collapsed
  const getSummaryText = () => {
    const parts: string[] = []
    if ((filters.q ?? '').trim()) parts.push(`"${(filters.q ?? '').trim()}"`)
    if ((filters.city ?? '').trim()) parts.push((filters.city ?? '').trim())
    if (mode === 'listings' && (filters.zone ?? '').trim()) parts.push((filters.zone ?? '').trim())
    if (mode === 'listings' && filters.listing_type !== 'all') {
      parts.push(filters.listing_type === 'room' ? 'Rento cuarto' : 'Busco roomie')
    }
    if (mode === 'listings' && ((filters.min ?? '').trim() || (filters.max ?? '').trim())) {
      parts.push('Precio')
    }
    if (mode === 'roomies' && ((filters.budget_min ?? '').trim() || (filters.budget_max ?? '').trim())) {
      parts.push('Presupuesto')
    }
    return parts.length > 0 ? parts.join(' · ') : 'Buscar'
  }

  return (
    <>
      <div className="relative flex-1 max-w-2xl mx-auto">
        {/* Barra pill */}
        {isOpen ? (
          <div ref={triggerRef}>
            <SearchInput
              value={filters.city || ''}
              onChange={(value) => {
                setFilters({ ...filters, city: value })
                setSelectedLocationId(null)
                setValidationError(null)
              }}
              onEnter={handleSearch}
              onClear={clearLocationFromUIAndPersistence}
              activeFiltersCount={activeFiltersCount}
              autoFocus
            />
          </div>
        ) : (
          <div ref={triggerRef}>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="w-full flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-4 py-2.5 h-11 shadow-sm hover:shadow-md transition-shadow text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ring-1 ring-black/5"
            >
              <svg
                className="w-4 h-4 text-neutral-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {activeFiltersCount > 0 ? (
                <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
                  {(filters.q ?? '').trim() && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium truncate max-w-[120px]">
                      &ldquo;{(filters.q ?? '').trim().slice(0, 15)}{(filters.q ?? '').trim().length > 15 ? '...' : ''}&rdquo;
                    </span>
                  )}
                  {(filters.city ?? '').trim() && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium truncate max-w-[100px]">
                      {(filters.city ?? '').trim().slice(0, 12)}{(filters.city ?? '').trim().length > 12 ? '...' : ''}
                    </span>
                  )}
                  {mode === 'listings' && (filters.zone ?? '').trim() && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium truncate max-w-[100px]">
                      {(filters.zone ?? '').trim().slice(0, 12)}{(filters.zone ?? '').trim().length > 12 ? '...' : ''}
                    </span>
                  )}
                  {mode === 'listings' && filters.listing_type !== 'all' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium">
                      {filters.listing_type === 'room' ? 'Rento cuarto' : 'Busco roomie'}
                    </span>
                  )}
                  {(mode === 'listings' && ((filters.min ?? '').trim() || (filters.max ?? '').trim())) && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium">
                      Precio
                    </span>
                  )}
                  {(mode === 'roomies' && ((filters.budget_min ?? '').trim() || (filters.budget_max ?? '').trim())) && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium">
                      Presupuesto
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm text-neutral-700 truncate">
                  {getSummaryText()}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Popover compacto */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 rounded-3xl border border-neutral-200 bg-white p-3 md:p-4 shadow-xl z-50 w-[calc(100vw-2rem)] max-w-[720px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3">
              <LocationPicker
                cityQuery={cityQuery}
                onCityChange={(value) => {
                  setFilters({ ...filters, city: value })
                  setSelectedLocationId(null)
                  setValidationError(null)
                }}
                onSelectCity={handleSelectCity}
                isOpen={isOpen}
              />

              {validationError && (
                <div className="px-4 py-2 text-xs text-red-600 bg-red-50 rounded-lg border border-red-100">
                  {validationError}
                </div>
              )}

              {/* Filtros según mode */}
              {mode === 'listings' ? (
                <ListingsFilters
                  listing_type={filters.listing_type || 'all'}
                  min={filters.min || ''}
                  max={filters.max || ''}
                  onListingTypeChange={(value) => setFilters({ ...filters, listing_type: value })}
                  onMinChange={(value) => setFilters({ ...filters, min: value })}
                  onMaxChange={(value) => setFilters({ ...filters, max: value })}
                />
              ) : (
                <RoomiesFilters
                  budget_min={filters.budget_min || ''}
                  budget_max={filters.budget_max || ''}
                  onBudgetMinChange={(value) => setFilters({ ...filters, budget_min: value })}
                  onBudgetMaxChange={(value) => setFilters({ ...filters, budget_max: value })}
                />
              )}

              {/* Footer: Limpiar + Buscar */}
              <div className="flex gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2 border border-neutral-200 bg-white text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium text-sm"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="flex-1 px-4 py-2 bg-brand text-white rounded-xl hover:bg-brandHover transition-colors font-medium text-sm"
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
