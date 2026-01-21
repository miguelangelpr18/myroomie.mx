import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import RoomieCard from '../roomies/RoomieCard'

export default async function HomeFeaturedProfiles() {
  const supabase = createServerSupabaseClient()
  const now = new Date().toISOString()

  // Solo traer destacados: featured_until IS NOT NULL AND featured_until > now()
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('user_id, display_name, city, zone, avatar_url, featured_until, pets, smoker, cleanliness, parties, schedule')
    .gt('featured_until', now)
    .order('featured_until', { ascending: false })
    .limit(5)

  // Opción A: Ocultar sección completa si no hay destacados
  if (error || !profiles || profiles.length === 0) {
    return null
  }

  return (
    <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
      <div className="flex justify-between items-end gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-semibold tracking-tight text-neutral-900">
            Roomies destacados
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Perfiles promovidos para mayor visibilidad
          </p>
        </div>
        <Link
          href="/explore"
          className="text-sm font-medium text-neutral-700 hover:text-neutral-900"
        >
          Ver más
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {profiles.map((profile) => (
          <RoomieCard
            key={profile.user_id}
            profile={profile}
            href={`/profiles/${profile.user_id}`}
          />
        ))}
      </div>
    </div>
  )
}

