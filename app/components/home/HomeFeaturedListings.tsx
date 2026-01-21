import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ListingCard from '../listings/ListingCard'

export default async function HomeFeaturedListings() {
  const supabase = createServerSupabaseClient()
  const now = new Date().toISOString()

  // Solo traer destacados: featured_until IS NOT NULL AND featured_until > now()
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title, description, city, zone, price_mxn, listing_type, created_at, featured_until, image_urls')
    .gt('featured_until', now)
    .order('featured_until', { ascending: false })
    .limit(5)

  // Opción A: Ocultar sección completa si no hay destacados
  if (error || !listings || listings.length === 0) {
    return null
  }

  return (
    <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
      <div className="flex justify-between items-end gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-semibold tracking-tight text-neutral-900">
            Anuncios destacados
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Cuartos, depas y casas promovidos
          </p>
        </div>
        <Link
          href="/listings"
          className="text-sm font-medium text-neutral-700 hover:text-neutral-900"
        >
          Ver anuncios
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            href={`/listings/${listing.id}`}
          />
        ))}
      </div>
    </div>
  )
}

