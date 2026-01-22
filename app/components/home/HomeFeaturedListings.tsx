import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ListingCard from '../listings/ListingCard'
import FeaturedCarousel from './FeaturedCarousel'

export default async function HomeFeaturedListings() {
  const supabase = createServerSupabaseClient()
  const now = new Date().toISOString()

  // Solo traer destacados: featured_until IS NOT NULL AND featured_until > now()
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title, description, city, zone, price_mxn, listing_type, created_at, featured_until, image_urls')
    .gt('featured_until', now)
    .order('featured_until', { ascending: false })
    .limit(12)

  // Opción A: Ocultar sección completa si no hay destacados
  if (error || !listings || listings.length === 0) {
    return null
  }

  return (
    <section className="mt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex justify-between items-end gap-4 mb-6">
          <div>
            <h2 className="text-lg md:text-xl font-semibold tracking-[-0.01em] text-neutral-900">
              Anuncios destacados
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Cuartos, depas y casas promovidos
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

