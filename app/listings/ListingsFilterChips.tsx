'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'

const LISTING_TYPE_CHIPS = [
  { id: 'room', label: 'Rento cuarto', value: 'room' as const },
  { id: 'roommate', label: 'Busco compartir depa', value: 'roommate' as const },
]

const PRICE_DISPLAY_MIN = 500
const PRICE_DISPLAY_MAX = 80_000

/** Normaliza valor de URL para mostrar en input: NaN/vacío => ''; <500 => '500'; >80000 => '80000'. */
function normalizePriceDisplay(value: string): string {
  if (!value.trim()) return ''
  const num = parseInt(value.trim(), 10)
  if (Number.isNaN(num)) return ''
  if (num < PRICE_DISPLAY_MIN) return String(PRICE_DISPLAY_MIN)
  if (num > PRICE_DISPLAY_MAX) return String(PRICE_DISPLAY_MAX)
  return String(num)
}

export default function ListingsFilterChips() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentType = searchParams.get('listing_type') || 'all'
  const currentMin = searchParams.get('price_min') || searchParams.get('min') || ''
  const currentMax = searchParams.get('price_max') || searchParams.get('max') || ''

  const [minInput, setMinInput] = useState(() => normalizePriceDisplay(currentMin))
  const [maxInput, setMaxInput] = useState(() => normalizePriceDisplay(currentMax))

  useEffect(() => {
    setMinInput(normalizePriceDisplay(currentMin))
    setMaxInput(normalizePriceDisplay(currentMax))
  }, [currentMin, currentMax])

  const applyPrice = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('min')
    params.delete('max')
    if (minInput.trim()) params.set('price_min', minInput.trim())
    else params.delete('price_min')
    if (maxInput.trim()) params.set('price_max', maxInput.trim())
    else params.delete('price_max')
    const queryString = params.toString()
    router.push(queryString ? `/listings?${queryString}` : '/listings', { scroll: false })
  }, [router, searchParams, minInput, maxInput])

  const toggleListingType = useCallback(
    (value: 'room' | 'roommate') => {
      const params = new URLSearchParams(searchParams.toString())
      if (currentType === value) {
        params.delete('listing_type')
      } else {
        params.set('listing_type', value)
      }
      const queryString = params.toString()
      router.push(queryString ? `/listings?${queryString}` : '/listings', { scroll: false })
    },
    [router, searchParams, currentType]
  )

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {LISTING_TYPE_CHIPS.map((chip) => {
          const isActive = currentType === chip.value
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => toggleListingType(chip.value)}
              aria-pressed={isActive}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border
                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand/30
                ${isActive
                  ? 'bg-brand/10 border-brand/30 text-brand'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }
              `}
            >
              {chip.label}
            </button>
          )
        })}

        <span className="text-neutral-400 text-sm mx-1">|</span>

        <label className="flex items-center gap-1.5 text-sm text-neutral-600">
          <span>Min</span>
          <input
            type="number"
            min={0}
            placeholder="0"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyPrice())}
            className="w-20 px-2 py-1.5 rounded border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-transparent"
            aria-label="Precio mínimo MXN"
          />
        </label>
        <label className="flex items-center gap-1.5 text-sm text-neutral-600">
          <span>Max</span>
          <input
            type="number"
            min={0}
            placeholder="—"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyPrice())}
            className="w-20 px-2 py-1.5 rounded border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-transparent"
            aria-label="Precio máximo MXN"
          />
        </label>
        <button
          type="button"
          onClick={applyPrice}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2"
        >
          Aplicar
        </button>
      </div>
    </div>
  )
}
