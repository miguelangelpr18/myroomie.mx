'use client'

import { useState, useEffect, useRef } from 'react'

interface GeoCandidate {
  place_id: string
  label: string
  city: string | null
  region: string | null
  country?: string | null
  lat: number | null
  lng: number | null
}

interface RecentCity {
  label: string
  value: string
  location_id?: string
}

interface LocationPickerProps {
  cityQuery: string
  onCityChange: (value: string) => void
  onSelectCity: (label: string, value: string, locationId?: string, zone?: string) => Promise<void>
  isOpen: boolean
}

export default function LocationPicker({
  cityQuery,
  onCityChange,
  onSelectCity,
  isOpen,
}: LocationPickerProps) {
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [recentCity, setRecentCity] = useState<RecentCity | null>(null)
  const [cityUserEdited, setCityUserEdited] = useState(false)
  const [cityResultsLoading, setCityResultsLoading] = useState(false)
  const [cityResultsError, setCityResultsError] = useState<string | null>(null)
  const [cityResults, setCityResults] = useState<GeoCandidate[]>([])
  const [citySelectLoading, setCitySelectLoading] = useState(false)
  const [citySelectError, setCitySelectError] = useState<string | null>(null)

  // Leer ciudad reciente de localStorage cuando se abre
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      setCityUserEdited(false)
      setCityResults([])
      setCityResultsError(null)
      setCityResultsLoading(false)
      setCitySelectError(null)

      const lastLocationId = localStorage.getItem('last_location_id')
      const lastLocationLabel = localStorage.getItem('last_location_label')
      if (lastLocationId && lastLocationLabel) {
        setRecentCity({ label: lastLocationLabel, value: lastLocationLabel, location_id: lastLocationId })
      } else {
        const lastLabel = localStorage.getItem('last_city_label')
        const lastValue = localStorage.getItem('last_city_value')
        if (lastLabel && lastValue) {
          setRecentCity({ label: lastLabel, value: lastValue })
        } else {
          setRecentCity(null)
        }
      }
    }
  }, [isOpen])

  // Autocomplete de ciudades (debounced)
  useEffect(() => {
    if (!isOpen) return
    if (!cityUserEdited) return

    const q = cityQuery.trim()
    if (q.length < 3) {
      setCityResults([])
      setCityResultsError(null)
      setCityResultsLoading(false)
      return
    }

    const controller = new AbortController()
    setCityResultsLoading(true)
    setCityResultsError(null)

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geo/forward?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        })

        if (!res.ok) {
          const data = await res.json().catch(() => null)
          setCityResults([])
          setCityResultsError(data?.error || 'No se pudo buscar')
          setCityResultsLoading(false)
          return
        }

        const data = await res.json()
        const candidates = Array.isArray(data?.candidates) ? data.candidates.slice(0, 5) : []
        setCityResults(candidates)
        setCityResultsLoading(false)
      } catch (e) {
        if ((e as any)?.name === 'AbortError') return
        setCityResults([])
        setCityResultsError('No se pudo buscar')
        setCityResultsLoading(false)
      }
    }, 300)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [isOpen, cityUserEdited, cityQuery])

  const handleSelectAutocompleteResult = async (candidate: GeoCandidate) => {
    setCitySelectError(null)
    setGeoError(null)
    setCitySelectLoading(true)
    setCityUserEdited(false)

    try {
      const upsertResponse = await fetch('/api/locations/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'mapbox',
          place_id: candidate.place_id,
          label: candidate.label,
          city: candidate.city,
          region: candidate.region,
          country: candidate.country ?? null,
          lat: candidate.lat,
          lng: candidate.lng,
        }),
      })

      if (!upsertResponse.ok) {
        const data = await upsertResponse.json().catch(() => null)
        setCitySelectError(data?.error || 'No se pudo guardar la ubicación')
        setCitySelectLoading(false)
        return
      }

      const data = await upsertResponse.json()
      const locationId = data?.location_id
      if (!locationId || typeof locationId !== 'string') {
        setCitySelectError('No se pudo guardar la ubicación')
        setCitySelectLoading(false)
        return
      }

      let city = (candidate.city || candidate.label || '').trim()
      let zone = ''

      const hasLatLng =
        candidate.lat != null &&
        candidate.lng != null &&
        !Number.isNaN(Number(candidate.lat)) &&
        !Number.isNaN(Number(candidate.lng))

      if (hasLatLng) {
        try {
          const revRes = await fetch(
            `/api/geo/reverse?lat=${encodeURIComponent(String(candidate.lat))}&lng=${encodeURIComponent(String(candidate.lng))}`
          )
          if (revRes.status === 429) {
            setCitySelectError('Demasiadas solicitudes. Intenta de nuevo en un minuto.')
          }
          if (revRes.ok) {
            const revData = await revRes.json()
            if (revData.city != null && String(revData.city).trim()) {
              city = String(revData.city).trim()
            }
            if (revData.zone != null && String(revData.zone).trim()) {
              zone = String(revData.zone).trim()
            }
          }
        } catch {
          // reverse falló: no romper, zone queda vacío
        }
      }

      setCitySelectLoading(false)
      const displayLabel = zone ? `${zone}, ${city}` : candidate.label
      await onSelectCity(displayLabel, city, locationId, zone)
    } catch {
      setCitySelectError('No se pudo guardar la ubicación')
      setCitySelectLoading(false)
    }
  }

  const handleUseCurrentLocation = async () => {
    setGeoError(null)
    setCitySelectError(null)
    setGeoLoading(true)
    setCityUserEdited(false)

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

          if (response.status === 429) {
            setGeoError('Demasiadas solicitudes. Intenta de nuevo en un minuto.')
            setGeoLoading(false)
            return
          }
          if (response.status === 404) {
            setGeoError('Ubicación no encontrada en México.')
            setGeoLoading(false)
            return
          }
          if (!response.ok) {
            setGeoError('No se pudo obtener tu ubicación.')
            setGeoLoading(false)
            return
          }

          const data = await response.json()
          const cityTrim = (data.city ?? '').trim()
          const zoneTrim = (data.zone ?? '').trim()

          if (cityTrim.length < 2) {
            setGeoError('No se pudo obtener tu ubicación.')
            setGeoLoading(false)
            return
          }

          const displayLabel = zoneTrim ? `${zoneTrim}, ${cityTrim}` : cityTrim

          let locationId: string | undefined = undefined
          const placeId = data.place_id
          if (placeId) {
            try {
              const upsertResponse = await fetch('/api/locations/upsert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  provider: 'mapbox',
                  place_id: placeId,
                  label: data.label || displayLabel,
                  city: data.city || null,
                  region: data.region || null,
                  country: data.country || null,
                  lat: data.lat ?? null,
                  lng: data.lng ?? null,
                }),
              })
              if (upsertResponse.ok) {
                const upsertData = await upsertResponse.json()
                locationId = upsertData?.location_id
              }
            } catch {
              // Continuar sin location_id
            }
          }

          setGeoLoading(false)
          await onSelectCity(displayLabel, cityTrim, locationId, zoneTrim)
        } catch {
          setGeoError('No se pudo obtener tu ubicación.')
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

  return (
    <div className="space-y-3">
      {/* Cerca de aquí */}
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
      {citySelectError && (
        <div className="px-4 py-2 text-xs text-red-600 bg-red-50 rounded-lg border border-red-100">
          {citySelectError}
        </div>
      )}

      {/* Reciente */}
      {recentCity && (
        <div>
          <div className="px-2 mb-2">
            <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Reciente</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setCityUserEdited(false)
              onSelectCity(recentCity.label, recentCity.value, recentCity.location_id)
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
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

      {/* Resultados autocomplete */}
      {cityUserEdited && cityQuery.length >= 3 && (
        <div>
          <div className="px-2 mb-2">
            <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Resultados</h3>
          </div>

          {cityResultsLoading ? (
            <div className="px-4 py-2.5 text-xs text-neutral-500">Buscando...</div>
          ) : cityResultsError ? (
            <div className="px-4 py-2.5 text-xs text-neutral-500">{cityResultsError}</div>
          ) : cityResults.length === 0 ? (
            <div className="px-4 py-2.5 text-xs text-neutral-500">Sin resultados</div>
          ) : (
            <div className="space-y-1">
              {cityResults.map((c) => {
                const subtitle = [c.city, c.region].filter(Boolean).join(', ') || c.label
                return (
                  <button
                    key={c.place_id}
                    type="button"
                    onClick={() => handleSelectAutocompleteResult(c)}
                    disabled={citySelectLoading}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-neutral-900">{c.label}</span>
                      {subtitle !== c.label && (
                        <span className="text-xs text-neutral-500 truncate">{subtitle}</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
