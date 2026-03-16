import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireProfileOrRedirect } from '@/lib/requireProfile'
import Link from 'next/link'
import LifestyleBadges from '../../components/LifestyleBadges'
import ListingCard from '../../components/listings/ListingCard'
import Avatar from '../../components/ui/Avatar'
import EmptyState from '../../components/ui/EmptyState'
import ContactButton from './ContactButton'
import TrustPanel from '../../components/TrustPanel'
import ReportButton from '../../components/ReportButton'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: { user_id: string }
}): Promise<Metadata> {
  const supabase = createServerSupabaseClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, city, bio, avatar_url')
    .eq('user_id', params.user_id)
    .single()

  if (!profile) {
    return { title: 'Perfil no encontrado' }
  }

  const title = `Perfil de ${profile.display_name} en ${profile.city}`
  const description = profile.bio?.slice(0, 160) ?? 'Busca roomie en MyRoomie.mx'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: profile.avatar_url ? [{ url: profile.avatar_url }] : [],
      type: 'profile',
    },
  }
}

export default async function ProfilePage({
  params,
}: {
  params: { user_id: string }
}) {
  const supabase = createServerSupabaseClient()

  // Obtener sesión para verificar si es el propio perfil
  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === params.user_id

  // Obtener perfil por user_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, display_name, city, zone, avatar_url, bio, age, pets, smoker, cleanliness, parties, schedule, featured_until')
    .eq('user_id', params.user_id)
    .single()

  if (!profile || profileError) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center py-12 bg-neutral-50 rounded-xl border border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Perfil no encontrado
          </h2>
          <p className="text-neutral-500 text-sm mb-4">
            Es posible que este perfil haya sido eliminado o no esté disponible.
          </p>
          <Link
            href="/explore"
            className="inline-block bg-brand text-white px-6 py-2 rounded-lg hover:bg-brandHover text-sm font-medium"
          >
            Volver a explorar
          </Link>
        </div>
      </div>
    )
  }

  // Obtener listings del usuario
  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, description, city, zone, price_mxn, listing_type, created_at, featured_until, image_urls')
    .eq('user_id', params.user_id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(20)

  const initial = profile.display_name.charAt(0).toUpperCase()
  const now = new Date()
  const isFeatured = profile.featured_until && new Date(profile.featured_until) > now

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/explore"
          className="text-brand hover:underline text-sm"
        >
          ← Volver
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar
            src={profile.avatar_url}
            alt={profile.display_name}
            size="xl"
            initial={initial}
          />
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{profile.display_name}</h1>
              {isFeatured && (
                <span className="inline-block px-3 py-1 bg-brand text-white rounded-full text-sm font-semibold">
                  Destacado
                </span>
              )}
            </div>
            <p className="text-neutral-600">
              {profile.city}, {profile.zone}
              {profile.age && ` · ${profile.age} años`}
            </p>
            {profile.bio && (
              <p className="text-sm text-neutral-600 mt-2 max-w-md">
                {profile.bio}
              </p>
            )}
            <LifestyleBadges profile={profile} />
          </div>
        </div>
        {isOwnProfile ? (
        <Link
          href="/profiles/edit"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar perfil
        </Link>
      ) : (
        <ContactButton userId={profile.user_id} />
      )}
      </div>

      {/* Trust Panel: Ratings + Verifications */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm mb-6">
        <TrustPanel isOwner={isOwnProfile} />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6">Anuncios publicados</h2>

        {!listings || listings.length === 0 ? (
          <EmptyState
            icon="listings"
            title="Sin anuncios publicados"
            description="Este usuario aún no ha publicado anuncios."
            variant="compact"
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                href={`/listings/${listing.id}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reportar perfil */}
      {!isOwnProfile && (
        <div className="mt-6 flex justify-center">
          <ReportButton reportedType="profile" reportedId={params.user_id} />
        </div>
      )}
    </div>
  )
}

