import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import RoomieCard from '../roomies/RoomieCard'
import FeaturedCarousel from './FeaturedCarousel'

export default async function HomeFeaturedProfiles() {
  const supabase = createServerSupabaseClient()
  const now = new Date().toISOString()

  // Solo traer destacados: featured_until IS NOT NULL AND featured_until > now()
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('user_id, display_name, city, zone, avatar_url, featured_until, pets, smoker, cleanliness, parties, schedule')
    .gt('featured_until', now)
    .order('featured_until', { ascending: false })
    .limit(12)

  // Opción A: Ocultar sección completa si no hay destacados
  if (error || !profiles || profiles.length === 0) {
    return null
  }

  return (
    <section className="mt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex justify-between items-end gap-4 mb-6">
          <div>
            <h2 className="text-lg md:text-xl font-semibold tracking-[-0.01em] text-neutral-900">
              Roomies destacados
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Perfiles promovidos para mayor visibilidad
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-brand text-white hover:bg-brandHover transition-colors text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 whitespace-nowrap"
          >
            Ver más roomies
          </Link>
        </div>
        {/* Carousel */}
        <FeaturedCarousel>
          {profiles.map((profile) => (
            <div
              key={profile.user_id}
              data-carousel-item
              className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[280px] snap-start"
            >
              <RoomieCard
                profile={profile}
                href={`/profiles/${profile.user_id}`}
              />
            </div>
          ))}
        </FeaturedCarousel>
      </div>
    </section>
  )
}

