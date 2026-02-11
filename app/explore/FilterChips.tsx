'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface FilterChip {
  id: string
  label: string
  param: string
  value?: string
}

const CHIPS: FilterChip[] = [
  { id: 'featured', label: 'Destacados', param: 'featured', value: '1' },
  { id: 'pets', label: 'Mascotas', param: 'pets', value: '1' },
  { id: 'no_smoker', label: 'No fumador', param: 'no_smoker', value: '1' },
  { id: 'calm', label: 'Sin fiestas', param: 'calm', value: '1' },
  { id: 'schedule_day', label: 'Horario día', param: 'schedule', value: 'day' },
  { id: 'schedule_night', label: 'Horario noche', param: 'schedule', value: 'night' },
  { id: 'cleanliness_3', label: 'Muy ordenado', param: 'cleanliness', value: '3' },
]

export default function FilterChips() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const toggleFilter = useCallback(
    (param: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      const currentValue = params.get(param)
      if (currentValue === value) {
        params.delete(param)
      } else {
        params.set(param, value)
      }
      const queryString = params.toString()
      router.push(queryString ? `/explore?${queryString}` : '/explore', { scroll: false })
    },
    [router, searchParams]
  )

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {CHIPS.map((chip) => {
          const value = chip.value ?? '1'
          const isActive = searchParams.get(chip.param) === value

          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => toggleFilter(chip.param, value)}
              aria-pressed={isActive}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
                border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                ${
                  isActive
                    ? 'bg-brand/10 border-brand/30 text-brand focus-visible:ring-brand/30'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 focus-visible:ring-neutral-300'
                }
              `}
            >
              {chip.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

