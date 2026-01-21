'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ListingsSearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Estado local de filtros
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    city: searchParams.get('city') || '',
    zone: searchParams.get('zone') || '',
    listing_type: searchParams.get('listing_type') || 'all',
    min: searchParams.get('min') || '',
    max: searchParams.get('max') || '',
    sort: searchParams.get('sort') || 'recent',
  })

  // Sincronizar con URL params cuando cambian
  useEffect(() => {
    setFilters({
      q: searchParams.get('q') || '',
      city: searchParams.get('city') || '',
      zone: searchParams.get('zone') || '',
      listing_type: searchParams.get('listing_type') || 'all',
      min: searchParams.get('min') || '',
      max: searchParams.get('max') || '',
      sort: searchParams.get('sort') || 'recent',
    })
  }, [searchParams])

  // Cerrar panel al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen])

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (filters.q.trim()) params.set('q', filters.q.trim())
    if (filters.city.trim()) params.set('city', filters.city.trim())
    if (filters.zone.trim()) params.set('zone', filters.zone.trim())
    if (filters.listing_type !== 'all') params.set('listing_type', filters.listing_type)
    if (filters.min.trim()) params.set('min', filters.min.trim())
    if (filters.max.trim()) params.set('max', filters.max.trim())
    if (filters.sort !== 'recent') params.set('sort', filters.sort)

    router.push(`/listings?${params.toString()}`)
    setIsOpen(false)
  }

  const handleClear = () => {
    setFilters({
      q: '',
      city: '',
      zone: '',
      listing_type: 'all',
      min: '',
      max: '',
      sort: 'recent',
    })
    router.push('/listings')
    setIsOpen(false)
  }

  // Contar filtros activos
  const activeFiltersCount = [
    filters.q.trim(),
    filters.city.trim(),
    filters.zone.trim(),
    filters.listing_type !== 'all',
    filters.min.trim(),
    filters.max.trim(),
    filters.sort !== 'recent',
  ].filter(Boolean).length

  // Texto resumen para estado collapsed
  const getSummaryText = () => {
    const parts: string[] = []
    if (filters.q.trim()) parts.push(`"${filters.q.trim()}"`)
    if (filters.city.trim()) parts.push(filters.city.trim())
    if (filters.zone.trim()) parts.push(filters.zone.trim())
    if (filters.listing_type !== 'all') {
      parts.push(filters.listing_type === 'room' ? 'Rento cuarto' : 'Busco roomie')
    }
    if (filters.min.trim() || filters.max.trim()) {
      parts.push('Precio')
    }
    return parts.length > 0 ? parts.join(' · ') : 'Buscar'
  }

  return (
    <div className="relative mb-6">
      {/* Barra compacta collapsed */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow text-left"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm text-neutral-600 flex-shrink-0">🔍</span>
          <span className="text-sm text-neutral-700 truncate">
            {getSummaryText()}
          </span>
          {activeFiltersCount > 0 && (
            <span className="flex-shrink-0 text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <span className="text-sm text-neutral-500 flex-shrink-0">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {/* Panel expandido */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-neutral-200 bg-white p-4 md:p-6 shadow-lg z-50 max-h-[80vh] overflow-y-auto"
        >
          <div className="space-y-4">
            {/* Búsqueda por texto */}
            <div>
              <label htmlFor="search-q" className="block mb-2 text-sm font-medium text-neutral-900">
                Buscar
              </label>
              <input
                type="text"
                id="search-q"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                placeholder="Palabras clave..."
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            {/* Ciudad */}
            <div>
              <label htmlFor="search-city" className="block mb-2 text-sm font-medium text-neutral-900">
                Ciudad
              </label>
              <input
                type="text"
                id="search-city"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                placeholder="Ej: Monterrey, CDMX..."
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            {/* Zona */}
            <div>
              <label htmlFor="search-zone" className="block mb-2 text-sm font-medium text-neutral-900">
                Zona/Colonia (opcional)
              </label>
              <input
                type="text"
                id="search-zone"
                value={filters.zone}
                onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
                placeholder="Ej: Roma Norte, Polanco..."
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            {/* Tipo */}
            <div>
              <label htmlFor="search-type" className="block mb-2 text-sm font-medium text-neutral-900">
                Tipo
              </label>
              <select
                id="search-type"
                value={filters.listing_type}
                onChange={(e) => setFilters({ ...filters, listing_type: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="all">Todos</option>
                <option value="room">Rento cuarto</option>
                <option value="roommate">Busco roomie</option>
              </select>
            </div>

            {/* Rango de precio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search-min" className="block mb-2 text-sm font-medium text-neutral-900">
                  Precio mínimo
                </label>
                <input
                  type="number"
                  id="search-min"
                  value={filters.min}
                  onChange={(e) => setFilters({ ...filters, min: e.target.value })}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
              <div>
                <label htmlFor="search-max" className="block mb-2 text-sm font-medium text-neutral-900">
                  Precio máximo
                </label>
                <input
                  type="number"
                  id="search-max"
                  value={filters.max}
                  onChange={(e) => setFilters({ ...filters, max: e.target.value })}
                  placeholder="Sin límite"
                  min="0"
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
            </div>

            {/* Ordenar */}
            <div>
              <label htmlFor="search-sort" className="block mb-2 text-sm font-medium text-neutral-900">
                Ordenar por
              </label>
              <select
                id="search-sort"
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="recent">Más recientes</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
              </select>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 px-4 py-2 border border-neutral-200 bg-white text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={handleSearch}
                className="flex-1 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brandHover transition-colors font-medium"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

