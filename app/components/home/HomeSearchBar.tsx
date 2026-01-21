'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function HomeSearchBar() {
  const [mode, setMode] = useState<'roomies' | 'listings'>('roomies')
  const [city, setCity] = useState('')
  const router = useRouter()

  const cities = [
    { value: '', label: 'Cualquiera' },
    { value: 'Monterrey', label: 'Monterrey' },
    { value: 'CDMX', label: 'CDMX' },
    { value: 'Guadalajara', label: 'Guadalajara' },
    { value: 'Querétaro', label: 'Querétaro' },
    { value: 'Puebla', label: 'Puebla' },
    { value: 'Mérida', label: 'Mérida' },
  ]

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    const basePath = mode === 'roomies' ? '/explore' : '/listings'
    const query = city ? `?city=${encodeURIComponent(city)}` : ''
    
    router.push(`${basePath}${query}`)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 w-full max-w-3xl rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as 'roomies' | 'listings')}
          className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm"
        >
          <option value="roomies">Roomies</option>
          <option value="listings">Anuncios</option>
        </select>
        
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm md:flex-1"
        >
          {cities.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        
        <button
          type="submit"
          className="h-11 w-full md:w-auto rounded-xl bg-brand px-5 text-sm font-medium text-white hover:bg-brandHover transition-colors"
        >
          Buscar
        </button>
      </div>
    </form>
  )
}

