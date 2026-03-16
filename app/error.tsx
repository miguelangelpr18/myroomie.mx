'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
        <svg
          className="w-8 h-8 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-2">
        Algo salió mal
      </h1>
      <p className="text-neutral-500 text-sm max-w-md mb-8">
        Ocurrió un error inesperado. Puedes intentar recargar la página.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex h-10 items-center px-5 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brandHover transition-colors"
      >
        Reintentar
      </button>
    </div>
  )
}
