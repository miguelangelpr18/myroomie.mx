'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type GeoCandidate = {
  place_id: string
  label: string
  city: string | null
  region: string | null
  country?: string | null
  lat: number | null
  lng: number | null
}

type SelectedLocation = {
  location_id: string
  label: string
  city: string
  zone: string
}

/** Extrae ciudad del label como fallback: segundo segmento tras coma (trim). */
function cityFromLabel(label: string): string {
  const parts = label.split(',').map((p) => p.trim()).filter(Boolean)
  return parts.length >= 2 ? parts[1]! : parts[0] ?? label.trim()
}

export default function LocationPickerField({
  onSelect,
  onClear,
  error,
}: {
  onSelect: (payload: { location_id: string; city: string; zone: string }) => void
  onClear: () => void
  error?: string
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeoCandidate[]>([])
  const [selected, setSelected] = useState<SelectedLocation | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch(`/api/geo/forward?q=${encodeURIComponent(q.trim())}`)
      if (res.status === 429) {
        setFetchError('Demasiadas solicitudes. Intenta de nuevo en un minuto.')
        setResults([])
        setLoading(false)
        return
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setFetchError(data?.error || 'No se pudo buscar')
        setResults([])
        setLoading(false)
        return
      }
      const data = await res.json()
      const candidates = Array.isArray(data?.candidates) ? data.candidates : []
      setResults(candidates)
      setHighlightIndex(-1)
    } catch {
      setFetchError('No se pudo buscar')
      setResults([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults([])
      setFetchError(null)
      setLoading(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      fetchResults(query)
    }, 250)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, fetchResults])

  const handleSelect = useCallback(
    async (candidate: GeoCandidate) => {
      setFetchError(null)
      setLoading(true)
      try {
        const res = await fetch('/api/locations/upsert', {
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
        if (!res.ok) {
          const data = await res.json().catch(() => null)
          setFetchError(data?.error || 'No se pudo guardar la ubicación')
          setLoading(false)
          return
        }
        const data = await res.json()
        const locationId = data?.location_id
        if (!locationId || typeof locationId !== 'string') {
          setFetchError('No se pudo guardar la ubicación')
          setLoading(false)
          return
        }
        let city = candidate.city?.trim() || cityFromLabel(candidate.label)
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
              setFetchError('Demasiadas solicitudes. Intenta de nuevo en un minuto.')
            }

            if (revRes.ok) {
              const revData = await revRes.json()

              if (revData.city && String(revData.city).trim()) {
                city = String(revData.city).trim()
              }

              if (revData.zone && String(revData.zone).trim()) {
                zone = String(revData.zone).trim()
              }
            }
          } catch {
            // reverse falló → no romper nada
          }
        }

        setSelected({
          location_id: locationId,
          label: candidate.label,
          city,
          zone,
        })

        setResults([])
        setQuery(candidate.label)

        onSelect({
          location_id: locationId,
          city,
          zone,
        })
      } catch {
        setFetchError('No se pudo guardar la ubicación')
      }
      setLoading(false)
    },
    [onSelect]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (selected) {
      setSelected(null)
      onClear()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setResults([])
      setHighlightIndex(-1)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (results.length > 0 && highlightIndex >= 0 && highlightIndex < results.length) {
        handleSelect(results[highlightIndex]!)
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((i) => (i < results.length - 1 ? i + 1 : i))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((i) => (i > 0 ? i - 1 : -1))
      return
    }
  }

  useEffect(() => {
    const el = dropdownRef.current
    if (!el || highlightIndex < 0) return
    const item = el.children[highlightIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [highlightIndex])

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target || !containerRef.current?.contains(target)) {
        setResults([])
        setHighlightIndex(-1)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const showDropdown = results.length > 0 && !selected
  const displayError = error ?? fetchError

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor="location-picker-onboarding" className="block mb-2 font-medium text-neutral-700">
        Ubicación (ciudad/municipio) <span className="text-red-500">*</span>
      </label>
      <input
        id="location-picker-onboarding"
        type="text"
        autoComplete="off"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Ej: San Nicolás de los Garza, NL"
        className={`w-full px-4 py-2.5 rounded-xl border bg-muted/30 text-neutral-900 placeholder:text-neutral-500
          focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:border-transparent
          ${displayError ? 'border-red-300' : 'border-neutral-200'}
        `}
        aria-label="Ubicación (buscar ciudad o municipio)"
        aria-describedby={displayError ? 'location-picker-onboarding-error' : undefined}
        aria-invalid={!!displayError}
      />
      {loading && (
        <span className="absolute right-3 top-[2.6rem] text-xs text-neutral-500">Buscando…</span>
      )}
      {showDropdown && (
        <ul
          ref={dropdownRef}
          role="listbox"
          id="location-picker-onboarding-listbox"
          className="absolute z-10 mt-1 w-full rounded-xl border border-neutral-200 bg-white shadow-lg py-1 max-h-56 overflow-auto"
        >
          {results.map((c, i) => (
            <li
              key={c.place_id}
              role="option"
              aria-selected={highlightIndex === i}
              className={`px-4 py-2.5 cursor-pointer text-sm text-neutral-800 transition-colors
                ${highlightIndex === i ? 'bg-brand/10 text-brand' : 'hover:bg-muted/50'}
              `}
              onMouseEnter={() => setHighlightIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(c)
              }}
            >
              {c.label}
            </li>
          ))}
        </ul>
      )}
      {displayError && (
        <p id="location-picker-onboarding-error" className="mt-1.5 text-sm text-red-600">
          {displayError}
        </p>
      )}
      {selected && (
        <>
          <input type="hidden" name="location_id" value={selected.location_id} />
          <input type="hidden" name="city" value={selected.city} />
          <input type="hidden" name="zone" value={selected.zone} />
        </>
      )}
    </div>
  )
}
