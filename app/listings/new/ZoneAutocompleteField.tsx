'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Props = {
  locationId: string | null
  value: string
  onChange: (next: string) => void
  error?: string
}

export default function ZoneAutocompleteField({ locationId, value, onChange, error }: Props) {
  const [zones, setZones] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchZones = useCallback(async (q: string, locId: string) => {
    if (q.trim().length < 2) {
      setZones([])
      setFetchError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch(
        `/api/geo/zones?q=${encodeURIComponent(q.trim())}&location_id=${encodeURIComponent(locId)}`
      )
      if (res.status === 429) {
        setFetchError('Demasiadas solicitudes. Intenta de nuevo en un minuto.')
        setZones([])
        setLoading(false)
        return
      }
      if (!res.ok) {
        setFetchError('No se pudieron cargar zonas.')
        setZones([])
        setLoading(false)
        return
      }
      const data = await res.json()
      const list = Array.isArray(data?.zones) ? data.zones : []
      setZones(list)
      setOpen(true)
    } catch {
      setFetchError('No se pudieron cargar zonas.')
      setZones([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!locationId || value.trim().length < 2) {
      setZones([])
      setFetchError(null)
      setOpen(false)
      setLoading(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      fetchZones(value, locationId)
    }, 250)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [locationId, value, fetchZones])

  const handleSelect = useCallback(
    (zone: string) => {
      onChange(zone)
      setOpen(false)
      setZones([])
    },
    [onChange]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target || !containerRef.current?.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const displayError = error ?? fetchError
  const disabled = !locationId

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor="zone-autocomplete" className="block mb-2 font-medium text-neutral-700">
        Zona / Colonia <span className="text-red-500">*</span>
      </label>
      <input
        id="zone-autocomplete"
        type="text"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Ej. Del Valle, Cumbres 2do Sector, etc."
        maxLength={80}
        className={`w-full px-4 py-2.5 rounded-xl border bg-muted/30 text-neutral-900 placeholder:text-neutral-500
          focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:border-transparent
          disabled:opacity-60 disabled:cursor-not-allowed
          ${displayError ? 'border-red-300' : 'border-neutral-200'}
        `}
        aria-label="Zona o colonia"
        aria-describedby={displayError ? 'zone-autocomplete-error' : disabled ? 'zone-autocomplete-helper' : undefined}
        aria-invalid={!!displayError}
      />
      {loading && (
        <span className="absolute right-3 top-[2.6rem] text-xs text-neutral-500">Buscando…</span>
      )}
      {disabled && (
        <p id="zone-autocomplete-helper" className="mt-1.5 text-sm text-muted-foreground">
          Selecciona una ubicación primero.
        </p>
      )}
      {open && zones.length > 0 && (
        <ul
          role="listbox"
          id="zone-autocomplete-listbox"
          className="absolute z-10 mt-1 w-full rounded-xl border border-neutral-200 bg-white shadow-lg py-1 max-h-56 overflow-auto"
        >
          {zones.map((zone) => (
            <li
              key={zone}
              role="option"
              className="px-4 py-2.5 cursor-pointer text-sm text-neutral-800 transition-colors hover:bg-muted/50"
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(zone)
              }}
            >
              {zone}
            </li>
          ))}
        </ul>
      )}
      {displayError && (
        <p id="zone-autocomplete-error" className="mt-1.5 text-sm text-red-600">
          {displayError}
        </p>
      )}
      {!disabled && !displayError && (
        <p className="mt-1 text-sm text-muted-foreground">
          Indica la colonia o zona exacta del inmueble.
        </p>
      )}
    </div>
  )
}
