'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface GlobalSearchBarProps {
  mode?: 'listings' | 'roomies'
}

export default function GlobalSearchBar({ mode: propMode }: GlobalSearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [recentCity, setRecentCity] = useState<{ label: string; value: string; location_id?: string } | null>(null)

  // Sugerencias de ciudades hardcodeadas
  const citySuggestions = [
    { label: 'Monterrey, Nuevo León', value: 'Monterrey' },
    { label: 'San Nicolás de los Garza, Nuevo León', value: 'San Nicolás de los Garza' },
    { label: 'San Pedro Garza García, Nuevo León', value: 'San Pedro Garza García' },
    { label: 'Santa Catarina, Nuevo León', value: 'Santa Catarina' },
    { label: 'Guadalupe, Nuevo León', value: 'Guadalupe' },
  ]

  // Determinar mode según pathname si no se pasa como prop
  // Si pathname es /explore, usar mode 'roomies', sino 'listings'
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
  }, [searchParams, pathname, propMode])

  // Leer ciudad reciente de localStorage cuando se abre el dropdown
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      // Priorizar location_id si existe
      const lastLocationId = localStorage.getItem('last_location_id')
      const lastLocationLabel = localStorage.getItem('last_location_label')
      if (lastLocationId && lastLocationLabel) {
        setRecentCity({ label: lastLocationLabel, value: lastLocationLabel, location_id: lastLocationId })
        // Poblar input de ciudad con el label completo solo si está vacío
        setFilters((prevFilters: any) => ({
          ...prevFilters,
          city: prevFilters.city || lastLocationLabel,
        }))
      } else {
        // Fallback a city legacy
        const lastLabel = localStorage.getItem('last_city_label')
        const lastValue = localStorage.getItem('last_city_value')
        if (lastLabel && lastValue) {
          setRecentCity({ label: lastLabel, value: lastValue })
          // Poblar input de ciudad con el label legacy solo si está vacío
          setFilters((prevFilters: any) => ({
            ...prevFilters,
            city: prevFilters.city || lastLabel,
          }))
        } else {
          setRecentCity(null)
        }
      }
    }
  }, [isOpen])

  // Auto-focus al abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // El overlay maneja el cierre con click fuera, no necesitamos este effect adicional

  // Cerrar con ESC y prevenir scroll cuando está abierto
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      // Prevenir scroll en body cuando search está abierto (especialmente mobile)
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEsc)
      return () => {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', handleEsc)
      }
    }
  }, [isOpen])

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (mode === 'roomies') {
      if ((filters.q ?? '').trim()) params.set('q', (filters.q ?? '').trim())
      if ((filters.city ?? '').trim()) params.set('city', (filters.city ?? '').trim())
      if ((filters.budget_min ?? '').trim()) params.set('budget_min', (filters.budget_min ?? '').trim())
      if ((filters.budget_max ?? '').trim()) params.set('budget_max', (filters.budget_max ?? '').trim())
    } else {
      if ((filters.q ?? '').trim()) params.set('q', (filters.q ?? '').trim())
      if ((filters.city ?? '').trim()) params.set('city', (filters.city ?? '').trim())
      if ((filters.zone ?? '').trim()) params.set('zone', (filters.zone ?? '').trim())
      if (filters.listing_type !== 'all') params.set('listing_type', filters.listing_type)
      if ((filters.min ?? '').trim()) params.set('min', (filters.min ?? '').trim())
      if ((filters.max ?? '').trim()) params.set('max', (filters.max ?? '').trim())
      if (filters.sort !== 'recent') params.set('sort', filters.sort)
    }

    router.push(`${targetPath}?${params.toString()}`)
    setIsOpen(false)
  }

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
    router.push(targetPath)
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

  // Manejar selección de ciudad (reciente o sugerencia)
  const handleSelectCity = async (label: string, value: string, locationId?: string) => {
    // Si hay locationId, usar label completo; sino usar value (legacy)
    setFilters({ ...filters, city: locationId ? label : value })
    setGeoError(null)

    // Si viene location_id, usarlo; sino usar city (legacy)
    const params = new URLSearchParams()
    if (mode === 'roomies') {
      if ((filters.q ?? '').trim()) params.set('q', (filters.q ?? '').trim())
      if (locationId) {
        params.set('location_id', locationId)
      } else {
        params.set('city', value)
      }
      if ((filters.budget_min ?? '').trim()) params.set('budget_min', (filters.budget_min ?? '').trim())
      if ((filters.budget_max ?? '').trim()) params.set('budget_max', (filters.budget_max ?? '').trim())
    } else {
      if ((filters.q ?? '').trim()) params.set('q', (filters.q ?? '').trim())
      if (locationId) {
        params.set('location_id', locationId)
      } else {
        params.set('city', value)
      }
      if ((filters.zone ?? '').trim()) params.set('zone', (filters.zone ?? '').trim())
      if (filters.listing_type !== 'all') params.set('listing_type', filters.listing_type)
      if ((filters.min ?? '').trim()) params.set('min', (filters.min ?? '').trim())
      if ((filters.max ?? '').trim()) params.set('max', (filters.max ?? '').trim())
      if (filters.sort !== 'recent') params.set('sort', filters.sort)
    }

    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      if (locationId) {
        localStorage.setItem('last_location_id', locationId)
        localStorage.setItem('last_location_label', label)
      } else {
        // Legacy: guardar también city para compatibilidad
        localStorage.setItem('last_city_label', label)
        localStorage.setItem('last_city_value', value)
      }
    }

    router.push(`${targetPath}?${params.toString()}`)
    setIsOpen(false)
  }

  // Manejar geolocalización
  const handleUseCurrentLocation = async () => {
    setGeoError(null)
    setGeoLoading(true)

    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización')
      setGeoLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch(`/api/geo/reverse?lat=${latitude}&lng=${longitude}`)
          
          if (!response.ok) {
            const data = await response.json()
            setGeoError(data.error || 'Error al obtener la ubicación')
            setGeoLoading(false)
            return
          }

          const data = await response.json()
          const cityValue = data.city || data.label || ''
          const cityLabel = data.label || cityValue
          const placeId = data.place_id

          // Si tenemos place_id, hacer upsert en locations para obtener location_id
          let locationId: string | undefined = undefined
          if (placeId) {
            try {
              const upsertResponse = await fetch('/api/locations/upsert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  provider: 'mapbox',
                  place_id: placeId,
                  label: cityLabel,
                  city: data.city || null,
                  region: data.region || null,
                  country: data.country || null,
                  lat: data.lat || null,
                  lng: data.lng || null,
                }),
              })

              if (upsertResponse.ok) {
                const upsertData = await upsertResponse.json()
                locationId = upsertData.location_id
              }
            } catch (error) {
              console.error('Error al hacer upsert de location:', error)
              // Continuar con city legacy si falla
            }
          }

          // Guardar en localStorage
          if (typeof window !== 'undefined') {
            if (locationId) {
              localStorage.setItem('last_location_id', locationId)
              localStorage.setItem('last_location_label', cityLabel)
            } else {
              // Legacy: guardar también city para compatibilidad
              localStorage.setItem('last_city_label', cityLabel)
              localStorage.setItem('last_city_value', cityValue)
            }
          }

          // Actualizar filtro con label completo si hay locationId, sino con cityValue (legacy)
          setFilters({ ...filters, city: locationId ? cityLabel : cityValue })
          
          // Aplicar searchParams inmediatamente
          const params = new URLSearchParams()
          if (mode === 'roomies') {
            if ((filters.q ?? '').trim()) params.set('q', (filters.q ?? '').trim())
            if (locationId) {
              params.set('location_id', locationId)
            } else {
              params.set('city', cityValue)
            }
            if ((filters.budget_min ?? '').trim()) params.set('budget_min', (filters.budget_min ?? '').trim())
            if ((filters.budget_max ?? '').trim()) params.set('budget_max', (filters.budget_max ?? '').trim())
          } else {
            if ((filters.q ?? '').trim()) params.set('q', (filters.q ?? '').trim())
            if (locationId) {
              params.set('location_id', locationId)
            } else {
              params.set('city', cityValue)
            }
            if ((filters.zone ?? '').trim()) params.set('zone', (filters.zone ?? '').trim())
            if (filters.listing_type !== 'all') params.set('listing_type', filters.listing_type)
            if ((filters.min ?? '').trim()) params.set('min', (filters.min ?? '').trim())
            if ((filters.max ?? '').trim()) params.set('max', (filters.max ?? '').trim())
            if (filters.sort !== 'recent') params.set('sort', filters.sort)
          }

          router.push(`${targetPath}?${params.toString()}`)
          setGeoLoading(false)
        } catch (error) {
          setGeoError('Error al procesar la ubicación')
          setGeoLoading(false)
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('Permiso de ubicación denegado')
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGeoError('Ubicación no disponible')
        } else {
          setGeoError('Error al obtener la ubicación')
        }
        setGeoLoading(false)
      }
    )
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
      {/* Overlay para cerrar con click fuera */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="relative flex-1 max-w-2xl mx-auto">
        {/* Barra pill con input cuando está abierto */}
        {isOpen ? (
          <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-4 py-2.5 h-11 shadow-sm focus-within:ring-2 focus-within:ring-brand/30 ring-1 ring-black/5">
            <svg
              className="w-4 h-4 text-neutral-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={filters.q || ''}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              placeholder="Buscar..."
              className="flex-1 text-sm text-neutral-700 bg-transparent border-none outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
            />
            {activeFiltersCount > 0 && (
              <span className="flex-shrink-0 text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full font-medium">
                {activeFiltersCount}
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        ) : (
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
                    "{(filters.q ?? '').trim().slice(0, 15)}{(filters.q ?? '').trim().length > 15 ? '...' : ''}"
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
        )}

        {/* Popover compacto */}
        {isOpen && (
          <div
            ref={panelRef}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 rounded-3xl border border-neutral-200 bg-white p-3 md:p-4 shadow-xl z-50 w-[calc(100vw-2rem)] max-w-[720px]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              // Prevenir que ESC cierre el popover si está dentro (ya se maneja en el effect)
              if (e.key === 'Escape') {
                e.stopPropagation()
              }
            }}
          >
            <div className="space-y-3">
              {/* Opción: Cerca de aquí */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={geoLoading}
                className="w-full flex items-center gap-3 px-4 py-2.5 h-11 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5 text-neutral-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-neutral-900">📍 Cerca de aquí</div>
                  <div className="text-xs text-neutral-500">Usar ubicación actual</div>
                </div>
                {geoLoading && (
                  <svg
                    className="w-4 h-4 text-neutral-400 animate-spin flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
              </button>
              {geoError && (
                <div className="px-4 py-2 text-xs text-red-600 bg-red-50 rounded-lg border border-red-100">
                  {geoError}
                </div>
              )}

              {/* Sección: Reciente */}
              {recentCity && (
                <div>
                  <div className="px-2 mb-2">
                    <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Reciente</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectCity(recentCity.label, recentCity.value, recentCity.location_id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                    role="button"
                  >
                    <svg
                      className="w-4 h-4 text-neutral-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium text-neutral-900">{recentCity.label}</span>
                  </button>
                </div>
              )}

              {/* Sección: Sugerencias */}
              <div>
                <div className="px-2 mb-2">
                  <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Sugerencias</h3>
                </div>
                <div className="space-y-1">
                  {citySuggestions.map((city) => (
                    <button
                      key={city.value}
                      type="button"
                      onClick={() => handleSelectCity(city.label, city.value)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                      role="button"
                    >
                      <svg
                        className="w-4 h-4 text-neutral-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium text-neutral-900">{city.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 1: Ciudad */}
              <div>
                <input
                  type="text"
                  value={filters.city || ''}
                  onChange={(e) => {
                    setFilters({ ...filters, city: e.target.value })
                    setGeoError(null)
                  }}
                  placeholder="Ciudad"
                  className="w-full px-4 py-2.5 h-11 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                />
              </div>

              {/* Row 2: Tipo (solo listings) y Precio/Presupuesto */}
              {mode === 'listings' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={filters.listing_type || 'all'}
                    onChange={(e) => setFilters({ ...filters, listing_type: e.target.value })}
                    className="w-full px-4 py-2.5 h-11 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                  >
                    <option value="all">Todos</option>
                    <option value="room">Rento cuarto</option>
                    <option value="roommate">Busco roomie</option>
                  </select>
                  <input
                    type="number"
                    value={filters.min || ''}
                    onChange={(e) => setFilters({ ...filters, min: e.target.value })}
                    placeholder="Precio min"
                    min="0"
                    className="w-full px-4 py-2.5 h-11 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                  />
                  <input
                    type="number"
                    value={filters.max || ''}
                    onChange={(e) => setFilters({ ...filters, max: e.target.value })}
                    placeholder="Precio max"
                    min="0"
                    className="w-full px-4 py-2.5 h-11 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={filters.budget_min || ''}
                    onChange={(e) => setFilters({ ...filters, budget_min: e.target.value })}
                    placeholder="Presupuesto min"
                    min="0"
                    className="w-full px-4 py-2.5 h-11 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                  />
                  <input
                    type="number"
                    value={filters.budget_max || ''}
                    onChange={(e) => setFilters({ ...filters, budget_max: e.target.value })}
                    placeholder="Presupuesto max"
                    min="0"
                    className="w-full px-4 py-2.5 h-11 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                  />
                </div>
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
