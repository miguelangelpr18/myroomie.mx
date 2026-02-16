'use client'

import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

const LISTINGS_ALLOWED = ['location_id', 'q', 'zone', 'price_min', 'price_max', 'listing_type', 'sort'] as const
const EXPLORE_ALLOWED = ['location_id', 'q', 'zone', 'featured', 'pets', 'no_smoker', 'calm', 'schedule', 'cleanliness'] as const

function getParam(sp: URLSearchParams, key: string): string {
  const v = sp.get(key)
  return typeof v === 'string' ? v.trim() : ''
}

export default function CanonicalLocationParams({ mode }: { mode: 'listings' | 'explore' }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const locationIdParam = getParam(searchParams, 'location_id')
    const locationId = locationIdParam.length >= 10 ? locationIdParam : ''
    if (!locationId) return

    const allowed = mode === 'listings' ? LISTINGS_ALLOWED : EXPLORE_ALLOWED
    const canonical = new URLSearchParams()
    for (const key of allowed) {
      const value = getParam(searchParams, key)
      if (value) canonical.set(key, value)
    }

    const canonicalStr = canonical.toString()
    const currentStr = searchParams.toString()
    if (canonicalStr === currentStr) return

    const canonicalUrl = canonicalStr ? `${pathname}?${canonicalStr}` : pathname
    router.replace(canonicalUrl, { scroll: false })
  }, [mode, pathname, searchParams, router])

  return null
}
