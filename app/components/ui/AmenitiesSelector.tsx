'use client'

import { useState } from 'react'

export type Amenity = 
  | 'WiFi'
  | 'Cocina'
  | 'Lavadora'
  | 'Refrigerador'
  | 'Cama'
  | 'Clóset'
  | 'Escritorio'
  | 'Baño Propio'
  | 'Aire Acondicionado'
  | 'Calefacción'
  | 'Estacionamiento'
  | 'Pet-friendly'
  | 'Smoke-friendly'
  | 'Elevador'
  | 'Seguridad 24/7'

interface AmenityItem {
  id: Amenity
  label: string
  icon: React.ReactNode
  category: 'esenciales' | 'habitacion' | 'comodidades' | 'reglas'
  priority?: boolean // Para resaltar en buscar_roomie
}

const AMENITIES_DATA: AmenityItem[] = [
  // Esenciales
  {
    id: 'WiFi',
    label: 'WiFi',
    category: 'esenciales',
    priority: true,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    ),
  },
  {
    id: 'Cocina',
    label: 'Cocina',
    category: 'esenciales',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12h18m-7 6h7" />
      </svg>
    ),
  },
  {
    id: 'Lavadora',
    label: 'Lavadora',
    category: 'esenciales',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="13" r="4" />
        <rect x="6" y="4" width="12" height="16" rx="2" />
        <path d="M9 7h.01M15 7h.01" />
      </svg>
    ),
  },
  {
    id: 'Refrigerador',
    label: 'Refrigerador',
    category: 'esenciales',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6v3M9 14v3" />
        <line x1="4" y1="11" x2="20" y2="11" />
      </svg>
    ),
  },
  // Habitación
  {
    id: 'Cama',
    label: 'Cama',
    category: 'habitacion',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'Clóset',
    label: 'Clóset',
    category: 'habitacion',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    id: 'Escritorio',
    label: 'Escritorio',
    category: 'habitacion',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    id: 'Baño Propio',
    label: 'Baño Propio',
    category: 'habitacion',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
  },
  // Comodidades
  {
    id: 'Aire Acondicionado',
    label: 'Aire Acond.',
    category: 'comodidades',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    id: 'Calefacción',
    label: 'Calefacción',
    category: 'comodidades',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
  },
  {
    id: 'Estacionamiento',
    label: 'Estacionamiento',
    category: 'comodidades',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  // Reglas/Vibe
  {
    id: 'Pet-friendly',
    label: 'Pet-friendly',
    category: 'reglas',
    priority: true,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'Smoke-friendly',
    label: 'Smoke-friendly',
    category: 'reglas',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
  },
  {
    id: 'Elevador',
    label: 'Elevador',
    category: 'reglas',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  },
  {
    id: 'Seguridad 24/7',
    label: 'Seguridad 24/7',
    category: 'reglas',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
]

interface AmenitiesSelectorProps {
  selected: Amenity[]
  onChange: (amenities: Amenity[]) => void
  highlightPriority?: boolean // Para buscar_roomie
}

export default function AmenitiesSelector({
  selected,
  onChange,
  highlightPriority = false,
}: AmenitiesSelectorProps) {
  const toggleAmenity = (amenity: Amenity) => {
    if (selected.includes(amenity)) {
      onChange(selected.filter((a) => a !== amenity))
    } else {
      onChange([...selected, amenity])
    }
  }

  // Agrupar por categoría
  const categories = [
    { id: 'esenciales', label: 'Esenciales', items: AMENITIES_DATA.filter((a) => a.category === 'esenciales') },
    { id: 'habitacion', label: 'Habitación', items: AMENITIES_DATA.filter((a) => a.category === 'habitacion') },
    { id: 'comodidades', label: 'Comodidades', items: AMENITIES_DATA.filter((a) => a.category === 'comodidades') },
    { id: 'reglas', label: 'Reglas/Vibe', items: AMENITIES_DATA.filter((a) => a.category === 'reglas') },
  ]

  return (
    <div className="space-y-6">
      <div>
        <label className="block mb-3 font-medium text-neutral-700">
          Amenidades y características
        </label>
        <p className="text-sm text-neutral-500 mb-4">
          Selecciona todo lo que incluye tu espacio (opcional)
        </p>
      </div>

      {categories.map((category) => (
        <div key={category.id}>
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            {category.label}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {category.items.map((amenity) => {
              const isSelected = selected.includes(amenity.id)
              const isPriority = highlightPriority && amenity.priority

              return (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all hover:shadow-md group ${
                    isSelected
                      ? 'border-brand bg-brand/5'
                      : isPriority
                      ? 'border-brandBorder bg-brandSoft/30 hover:border-brand'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  {/* Checkmark cuando seleccionado */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  {/* Badge de prioridad */}
                  {!isSelected && isPriority && (
                    <div className="absolute top-2 right-2">
                      <span className="text-xs bg-brand/80 text-white px-1.5 py-0.5 rounded-full font-medium">
                        ★
                      </span>
                    </div>
                  )}

                  <div
                    className={`transition-colors ${
                      isSelected
                        ? 'text-brand'
                        : isPriority
                        ? 'text-brand/70 group-hover:text-brand'
                        : 'text-neutral-500 group-hover:text-neutral-700'
                    }`}
                  >
                    {amenity.icon}
                  </div>
                  <span
                    className={`text-xs text-center font-medium leading-tight ${
                      isSelected
                        ? 'text-brand'
                        : isPriority
                        ? 'text-neutral-700'
                        : 'text-neutral-600'
                    }`}
                  >
                    {amenity.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {selected.length > 0 && (
        <div className="flex items-start gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-green-800">
              {selected.length} {selected.length === 1 ? 'amenidad seleccionada' : 'amenidades seleccionadas'}
            </p>
            <p className="text-xs text-green-700 mt-1">
              Las amenidades ayudan a generar hasta 2× más interés en tu anuncio
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
