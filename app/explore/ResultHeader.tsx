'use client'

import { useRouter } from 'next/navigation'

interface ResultHeaderProps {
  count: number
  activeFilters: {
    featured?: boolean
    pets?: boolean
    no_smoker?: boolean
    calm?: boolean
  }
  hasSearch: boolean
  searchQuery?: string
  hasCity?: boolean
  cityName?: string
}

const FILTER_LABELS: Record<string, string> = {
  featured: 'Destacados',
  pets: 'Con mascotas',
  no_smoker: 'No fuma',
  calm: 'Tranquilo',
}

export default function ResultHeader({
  count,
  activeFilters,
  hasSearch,
  searchQuery,
  hasCity,
  cityName,
}: ResultHeaderProps) {
  const router = useRouter()

  // Contar filtros activos
  const activeFiltersCount = Object.values(activeFilters).filter(Boolean).length
  const hasAnyFilter = activeFiltersCount > 0 || hasSearch || hasCity

  const handleClear = () => {
    router.push('/explore', { scroll: false })
  }

  return (
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex-1">
        <p className="text-sm text-neutral-600">
          Mostrando <strong className="font-semibold text-neutral-900">{count}</strong>{' '}
          {count === 1 ? 'perfil' : 'perfiles'}
        </p>

        {/* Badges de filtros activos */}
        {hasAnyFilter && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {/* Filtros de chips */}
            {Object.entries(activeFilters).map(([key, isActive]) => {
              if (!isActive) return null
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FF7A18]/10 text-xs font-medium text-[#FF7A18] border border-[#FF7A18]/20"
                >
                  {FILTER_LABELS[key]}
                </span>
              )
            })}

            {/* Búsqueda */}
            {hasSearch && searchQuery && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-neutral-100 text-xs font-medium text-neutral-700 border border-neutral-200">
                Búsqueda: <span className="ml-1 font-semibold">&quot;{searchQuery}&quot;</span>
              </span>
            )}

            {/* Ciudad */}
            {hasCity && cityName && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-neutral-100 text-xs font-medium text-neutral-700 border border-neutral-200">
                Ciudad: <span className="ml-1 font-semibold">{cityName}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Botón Limpiar */}
      {hasAnyFilter && (
        <button
          type="button"
          onClick={handleClear}
          className="flex-shrink-0 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF7A18]/30 focus:ring-offset-2"
        >
          Limpiar
        </button>
      )}
    </div>
  )
}

