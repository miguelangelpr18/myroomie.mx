'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface FilterChip {
  id: string
  label: string
  param: string
}

const CHIPS: FilterChip[] = [
  { id: 'featured', label: 'Destacados', param: 'featured' },
  { id: 'pets', label: 'Con mascotas', param: 'pets' },
  { id: 'no_smoker', label: 'No fuma', param: 'no_smoker' },
  { id: 'calm', label: 'Tranquilo', param: 'calm' },
]

export default function FilterChips() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const toggleFilter = useCallback(
    (param: string) => {
      const params = new URLSearchParams(searchParams.toString())
      
      // Toggle: si existe y es '1', quitarlo; si no existe o es otro valor, ponerlo en '1'
      const currentValue = params.get(param)
      if (currentValue === '1') {
        params.delete(param)
      } else {
        params.set(param, '1')
      }

      // Actualizar URL sin recargar página
      const queryString = params.toString()
      router.push(queryString ? `/explore?${queryString}` : '/explore', { scroll: false })
    },
    [router, searchParams]
  )

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {CHIPS.map((chip) => {
          const isActive = searchParams.get(chip.param) === '1'
          
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => toggleFilter(chip.param)}
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

