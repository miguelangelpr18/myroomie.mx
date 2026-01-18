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
  })

  // Actualizar estado cuando searchParams cambian (ej: navegación atrás/adelante)
  useEffect(() => {
    setFilters({
      q: searchParams.get('q') || '',
      city: searchParams.get('city') || '',
      zone: searchParams.get('zone') || '',
    })
  }, [searchParams])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    // Construir URLSearchParams con filtros no vacíos
    const params = new URLSearchParams()
    
    if (filters.q.trim()) params.set('q', filters.q.trim())
    if (filters.city.trim()) params.set('city', filters.city.trim())
    if (filters.zone.trim()) params.set('zone', filters.zone.trim())

    // Actualizar URL sin recargar página
    const queryString = params.toString()
    router.push(queryString ? `/explore?${queryString}` : '/explore')
  }

  const handleClear = () => {
    // Resetear a valores por defecto
    setFilters({
      q: '',
      city: '',
      zone: '',
    })
    // Limpiar URL
    router.push('/explore')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="q" className="block mb-2 text-sm font-medium">
            Buscar por nombre
          </label>
          <input
            type="text"
            id="q"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="Nombre del usuario..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
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

