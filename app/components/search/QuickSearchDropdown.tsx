'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Listing {
  id: string
  title: string
  city: string
  zone: string
  price_mxn: number | null
  image_urls: string[] | null
}

interface Profile {
  user_id: string
  display_name: string
  city: string
  avatar_url: string | null
}

interface SearchResults {
  listings: Listing[]
  profiles: Profile[]
}

interface QuickSearchDropdownProps {
  placeholder?: string
  className?: string
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export default function QuickSearchDropdown({
  placeholder = 'Buscar roomies, anuncios, ciudades...',
  className = '',
}: QuickSearchDropdownProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults>({ listings: [], profiles: [] })
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  // Fetch results
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults({ listings: [], profiles: [] })
      setOpen(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data: SearchResults) => {
        if (!cancelled) {
          setResults(data)
          setOpen(data.listings.length > 0 || data.profiles.length > 0)
        }
      })
      .catch(() => {
        if (!cancelled) setResults({ listings: [], profiles: [] })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [debouncedQuery])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false)
      setQuery('')
      router.push(href)
    },
    [router]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
    if (e.key === 'Enter' && query.trim()) {
      setOpen(false)
      router.push(`/listings?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const hasResults = results.listings.length > 0 || results.profiles.length > 0

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-brand/30 ring-1 ring-black/5">
        <svg className="w-4 h-4 text-neutral-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (hasResults) setOpen(true) }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 text-sm text-neutral-700 bg-transparent border-none outline-none min-w-0"
          aria-label="Búsqueda rápida"
          aria-expanded={open}
          aria-autocomplete="list"
          role="combobox"
        />
        {loading && (
          <svg className="animate-spin h-3.5 w-3.5 text-neutral-400 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {query && !loading && (
          <button
            type="button"
            onClick={() => { setQuery(''); setOpen(false) }}
            aria-label="Limpiar"
            className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && hasResults && (
        <div
          role="listbox"
          className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden z-50 max-h-[400px] overflow-y-auto"
        >
          {results.listings.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide bg-neutral-50 border-b border-neutral-100">
                Anuncios
              </div>
              {results.listings.map((listing) => (
                <button
                  key={listing.id}
                  type="button"
                  role="option"
                  onClick={() => handleSelect(`/listings/${listing.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left"
                >
                  {listing.image_urls?.[0] ? (
                    <img
                      src={listing.image_urls[0]}
                      alt={listing.title}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-neutral-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex-shrink-0 flex items-center justify-center text-neutral-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{listing.title}</p>
                    <p className="text-xs text-neutral-500 truncate">
                      {listing.city}{listing.zone ? ` · ${listing.zone}` : ''}
                      {listing.price_mxn ? ` · $${listing.price_mxn.toLocaleString()} MXN` : ''}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {results.profiles.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide bg-neutral-50 border-b border-neutral-100">
                Roomies
              </div>
              {results.profiles.map((profile) => (
                <button
                  key={profile.user_id}
                  type="button"
                  role="option"
                  onClick={() => handleSelect(`/profiles/${profile.user_id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left"
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex-shrink-0 flex items-center justify-center text-sm font-semibold">
                      {profile.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{profile.display_name}</p>
                    <p className="text-xs text-neutral-500">{profile.city}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="px-4 py-2.5 border-t border-neutral-100 bg-neutral-50">
            <button
              type="button"
              onClick={() => handleSelect(`/listings?q=${encodeURIComponent(query)}`)}
              className="text-xs text-brand font-medium hover:underline"
            >
              Ver todos los resultados para &quot;{query}&quot; →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
