import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function sanitizeSearchQuery(q: string): string {
  // Remove characters that have meaning in PostgREST filter syntax
  return q.replace(/[(),%\\"']/g, ' ').replace(/\s+/g, ' ').trim()
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

  const [listingsRes, profilesRes] = await Promise.all([
    supabase
      .from('listings')
      .select('id, title, city, zone, price_mxn, image_urls')
      .eq('is_active', true)
      .or(`title.ilike.%${q}%,city.ilike.%${q}%,zone.ilike.%${q}%`)
      .limit(5),
    supabase
      .from('profiles')
      .select('user_id, display_name, city, avatar_url')
      .or(`display_name.ilike.%${q}%,city.ilike.%${q}%`)
      .limit(5),
  ])

  return NextResponse.json({
    listings: listingsRes.data || [],
    profiles: profilesRes.data || [],
  })
}
