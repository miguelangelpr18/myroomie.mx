import { MetadataRoute } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://www.myroomie.mx'
  const supabase = createServerSupabaseClient()

  const [listingsRes, profilesRes] = await Promise.all([
    supabase.from('listings').select('id, updated_at').eq('is_active', true).limit(500),
    supabase.from('profiles').select('user_id, updated_at').limit(500),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily' },
    { url: `${base}/explore`, lastModified: new Date(), changeFrequency: 'daily' },
    { url: `${base}/listings`, lastModified: new Date(), changeFrequency: 'daily' },
  ]

  const listingPages = (listingsRes.data || []).map((l) => ({
    url: `${base}/listings/${l.id}`,
    lastModified: l.updated_at ? new Date(l.updated_at) : new Date(),
  }))
  const profilePages = (profilesRes.data || []).map((p) => ({
    url: `${base}/profiles/${p.user_id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
  }))

  return [...staticPages, ...listingPages, ...profilePages]
}
