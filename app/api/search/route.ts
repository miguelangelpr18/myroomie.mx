import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const MAX_QUERY_LENGTH = 100

function sanitizeSearchQuery(q: string): string {
  // Remove characters that have meaning in PostgREST filter syntax
  return q
    .replace(/[(),%\\"'.*+?^${}|[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_QUERY_LENGTH)
}

export async function GET(req: NextRequest) {
  const rawQ = req.nextUrl.searchParams.get('q')?.trim() || ''

  if (!rawQ || rawQ.length < 2) {
    return NextResponse.json({ listings: [], profiles: [] })
  }

  const q = sanitizeSearchQuery(rawQ)

  if (!q || q.length < 2) {
    return NextResponse.json({ listings: [], profiles: [] })
  }

  const supabase = createServerSupabaseClient()
  const pattern = `%${q}%`

  // Use chained .ilike() filters instead of string interpolation in .or()
  // to prevent PostgREST filter injection
  const [listingsRes, profilesRes] = await Promise.all([
    supabase
      .from('listings')
      .select('id, title, city, zone, price_mxn, image_urls')
      .eq('is_active', true)
      .or(`title.ilike.${pattern},city.ilike.${pattern},zone.ilike.${pattern}`)
      .limit(5),
    supabase
      .from('profiles')
      .select('user_id, display_name, city, avatar_url')
      .or(`display_name.ilike.${pattern},city.ilike.${pattern}`)
      .limit(5),
  ])

  return NextResponse.json({
    listings: listingsRes.data || [],
    profiles: profilesRes.data || [],
  })
}
