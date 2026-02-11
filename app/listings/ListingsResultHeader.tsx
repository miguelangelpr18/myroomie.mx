'use client'

import { useRouter } from 'next/navigation'

interface ListingsResultHeaderProps {
  count: number
  activeFilterLabels: string[]
}

export default function ListingsResultHeader({
  count,
  activeFilterLabels,
}: ListingsResultHeaderProps) {
  const router = useRouter()
  const hasAnyFilter = activeFilterLabels.length > 0

  const handleClear = () => {
    router.push('/listings', { scroll: false })
  }

  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1">
        <p className="text-sm text-neutral-600">
          Mostrando <strong className="font-semibold text-neutral-900">{count}</strong>{' '}
          {count === 1 ? 'resultado' : 'resultados'}
        </p>
        {hasAnyFilter && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {activeFilterLabels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center px-2.5 py-1 rounded-full bg-brand/10 text-xs font-medium text-brand border border-brand/20"
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
      {hasAnyFilter && (
        <button
          type="button"
          onClick={handleClear}
          className="flex-shrink-0 h-9 px-3 rounded-lg text-sm font-medium text-neutral-700 bg-white ring-1 ring-black/10 hover:bg-neutral-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2"
        >
          Limpiar
        </button>
      )}
    </div>
  )
}
