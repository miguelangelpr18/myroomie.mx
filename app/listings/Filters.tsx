'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, FormEvent } from 'react'

export default function Filters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Estado inicial desde searchParams
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    city: searchParams.get('city') || '',
    zone: searchParams.get('zone') || '',
    listing_type: searchParams.get('listing_type') || 'all',
    min: searchParams.get('min') || '',
    max: searchParams.get('max') || '',
    sort: searchParams.get('sort') || 'recent',
  })

  // Actualizar estado cuando searchParams cambian (ej: navegación atrás/adelante)
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    // Construir URLSearchParams con filtros no vacíos
    const params = new URLSearchParams()
    
    if (filters.q.trim()) params.set('q', filters.q.trim())
    if (filters.city.trim()) params.set('city', filters.city.trim())
    if (filters.zone.trim()) params.set('zone', filters.zone.trim())
    if (filters.listing_type !== 'all') params.set('listing_type', filters.listing_type)
    if (filters.min.trim()) params.set('min', filters.min.trim())
    if (filters.max.trim()) params.set('max', filters.max.trim())
    if (filters.sort !== 'recent') params.set('sort', filters.sort)

    // Actualizar URL sin recargar página
    const queryString = params.toString()
    router.push(queryString ? `/listings?${queryString}` : '/listings')
  }

  const handleClear = () => {
    // Resetear a valores por defecto
    setFilters({
      q: '',
      city: '',
      zone: '',
      listing_type: 'all',
      min: '',
      max: '',
      sort: 'recent',
    })
    // Limpiar URL
    router.push('/listings')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="q" className="block mb-2 text-sm font-medium">
            Buscar
          </label>
          <input
            type="text"
            id="q"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="Título o descripción..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30 text-sm"
          />
        </div>

        <div>
          <label htmlFor="city" className="block mb-2 text-sm font-medium">
            Ciudad
          </label>
          <input
            type="text"
            id="city"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            placeholder="Ej: Ciudad de México"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30 text-sm"
          />
        </div>

        <div>
          <label htmlFor="zone" className="block mb-2 text-sm font-medium">
            Zona/Colonia
          </label>
          <input
            type="text"
            id="zone"
            value={filters.zone}
            onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
            placeholder="Ej: Roma Norte"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30 text-sm"
          />
        </div>

        <div>
          <label htmlFor="listing_type" className="block mb-2 text-sm font-medium">
            Tipo
          </label>
          <select
            id="listing_type"
            value={filters.listing_type}
            onChange={(e) => setFilters({ ...filters, listing_type: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30 text-sm"
          >
            <option value="all">Todos</option>
            <option value="room">Rento cuarto</option>
            <option value="roommate">Busco roomie</option>
          </select>
        </div>

        <div>
          <label htmlFor="min" className="block mb-2 text-sm font-medium">
            Precio mínimo (MXN)
          </label>
          <input
            type="number"
            id="min"
            value={filters.min}
            onChange={(e) => setFilters({ ...filters, min: e.target.value })}
            placeholder="Ej: 3000"
            min="0"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30 text-sm"
          />
        </div>

        <div>
          <label htmlFor="max" className="block mb-2 text-sm font-medium">
            Precio máximo (MXN)
          </label>
          <input
            type="number"
            id="max"
            value={filters.max}
            onChange={(e) => setFilters({ ...filters, max: e.target.value })}
            placeholder="Ej: 10000"
            min="0"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30 text-sm"
          />
        </div>

        <div>
          <label htmlFor="sort" className="block mb-2 text-sm font-medium">
            Ordenar por
          </label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30 text-sm"
          >
            <option value="recent">Más recientes</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-[#FF7A18] text-white px-6 py-2 rounded-lg hover:bg-[#E86F14] text-sm font-medium"
        >
          Aplicar filtros
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium"
        >
          Limpiar
        </button>
      </div>
    </form>
  )
}


