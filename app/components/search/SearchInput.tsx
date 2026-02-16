'use client'

import { useRef, useEffect } from 'react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onEnter: () => void
  onClear: () => void
  activeFiltersCount: number
  autoFocus?: boolean
}

export default function SearchInput({
  value,
  onChange,
  onEnter,
  onClear,
  activeFiltersCount,
  autoFocus = false,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [autoFocus])

  return (
    <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-4 py-2.5 h-11 shadow-sm focus-within:ring-2 focus-within:ring-brand/30 ring-1 ring-black/5">
      <svg
        className="w-4 h-4 text-neutral-500 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar..."
        className="flex-1 text-sm text-neutral-700 bg-transparent border-none outline-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onEnter()
          }
        }}
      />
      {activeFiltersCount > 0 && (
        <span className="flex-shrink-0 text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full font-medium">
          {activeFiltersCount}
        </span>
      )}
      <button
        type="button"
        onClick={onClear}
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
        aria-label="Limpiar ubicación"
      >
        ✕
      </button>
    </div>
  )
}
