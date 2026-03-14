import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ListingCard from '../listings/ListingCard'
import FeaturedCarousel from './FeaturedCarousel'

export default async function HomeFeaturedListings() {
  const supabase = createServerSupabaseClient()
  const now = new Date().toISOString()

  // 1. Intentar destacados: featured_until > now
  const { data: featured, error } = await supabase
    .from('listings')
    .select('id, title, description, city, zone, price_mxn, listing_type, created_at, featured_until, image_urls')
    .eq('is_active', true)
    .gt('featured_until', now)
    .order('featured_until', { ascending: false })
    .limit(12)

  let listings = featured
  let isFallback = false

  // 2. Fallback: si no hay destacados, traer recientes (activos)
  if (error || !featured || featured.length === 0) {
    const { data: recent } = await supabase
      .from('listings')
      .select('id, title, description, city, zone, price_mxn, listing_type, created_at, featured_until, image_urls')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(6)
    listings = recent
    isFallback = true
  }

  if (!listings || listings.length === 0) return null

  return (
    <section className="mt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-end gap-4 mb-6">
          <div>
            <h2 className="text-lg md:text-xl font-semibold tracking-[-0.01em] text-neutral-900">
              {isFallback ? 'Anuncios recientes' : 'Anuncios destacados'}
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              {isFallback ? 'Espacios disponibles ahora mismo' : 'Cuartos, depas y casas promovidos'}
            </p>
          </div>
          <Link
            href="/listings"
            className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-brand text-white hover:bg-brandHover transition-colors text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 whitespace-nowrap"
          >
            Ver más anuncios
          </Link>
        </div>
        {/* Carousel */}
        <FeaturedCarousel>
          {listings.map((listing) => (
            <div
              key={listing.id}
              data-carousel-item
              className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[280px] snap-start"
            >
              <ListingCard
                listing={listing}
                href={`/listings/${listing.id}`}
              />
            </div>
          ))}
        </FeaturedCarousel>
      </div>
    </section>
  )
}

