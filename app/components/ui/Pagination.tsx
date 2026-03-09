'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface PaginationProps {
  page: number
  total: number
  limit: number
}

export default function Pagination({ page, total, limit }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(total / limit)

  const goToPage = useCallback(
    (p: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (p === 1) {
        params.delete('page')
      } else {
        params.set('page', String(p))
      }
      const qs = params.toString()
      router.push(qs ? `?${qs}` : window.location.pathname, { scroll: true })
    },
    [router, searchParams]
  )

  if (totalPages <= 1) return null

  const getPages = () => {
    const pages: (number | '...')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('...')
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (page < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  const btnBase =
    'flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30'

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-1 mt-10">
      <button
        type="button"
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
        className={`${btnBase} border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="w-9 text-center text-neutral-400 text-sm select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => goToPage(p as number)}
            aria-current={p === page ? 'page' : undefined}
            className={`${btnBase} ${
              p === page
                ? 'bg-neutral-900 text-white border-neutral-900 border'
                : 'border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
        className={`${btnBase} border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  )
}
