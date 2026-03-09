'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const CITIES = [
  { label: 'Todas', value: '' },
  { label: 'Monterrey', value: 'Monterrey' },
  { label: 'CDMX', value: 'Ciudad de México' },
  { label: 'Guadalajara', value: 'Guadalajara' },
]

interface CityPillsProps {
  targetPath: '/listings' | '/explore'
}

export default function CityPills({ targetPath }: CityPillsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCity = searchParams.get('city') || ''

  const handleClick = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      // Clear location_id when selecting city pill (city takes priority)
      params.delete('location_id')
      if (value) {
        params.set('city', value)
      } else {
        params.delete('city')
      }
      const qs = params.toString()
      router.push(qs ? `${targetPath}?${qs}` : targetPath, { scroll: false })
    },
    [router, searchParams, targetPath]
  )

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {CITIES.map((city) => {
        const isActive = city.value === '' ? !currentCity : currentCity === city.value
        return (
          <button
            key={city.value}
            type="button"
            onClick={() => handleClick(city.value)}
            aria-pressed={isActive}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${
              isActive
                ? 'bg-neutral-900 border-neutral-900 text-white'
                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {city.label}
          </button>
        )
      })}
    </div>
  )
}
