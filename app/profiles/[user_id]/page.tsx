import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireProfileOrRedirect } from '@/lib/requireProfile'
import Link from 'next/link'
import LifestyleBadges from '../../components/LifestyleBadges'
import ListingImage from '../../components/listings/ListingImage'
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
  const { data: { session } } = await supabase.auth.getSession()
  const isOwnProfile = session?.user?.id === params.user_id

  // Obtener perfil por user_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, display_name, city, zone, avatar_url, pets, smoker, cleanliness, parties, schedule, featured_until')
    .eq('user_id', params.user_id)
    .single()

  // Si no existe o hay error, mostrar error amigable
  if (!profile || profileError) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Perfil no encontrado
          </h2>
          <p className="text-gray-600 text-sm mb-4">
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
    .select('id, title, city, zone, price_mxn, listing_type, created_at, image_urls')
    .eq('user_id', params.user_id)
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

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center gap-4 mb-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-brand text-white flex items-center justify-center text-3xl font-semibold">
              {initial}
            </div>
          )}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{profile.display_name}</h1>
              {isFeatured && (
                <span className="inline-block px-3 py-1 bg-brand text-white rounded-full text-sm font-semibold">
                  Destacado
                </span>
              )}
            </div>
            <p className="text-gray-600">
              {profile.city}, {profile.zone}
            </p>
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
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <TrustPanel isOwner={isOwnProfile} />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Anuncios publicados</h2>

        {!listings || listings.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm">Este usuario aún no ha publicado anuncios.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {listings.map((listing) => {
              const typeLabel = listing.listing_type === 'room' ? 'Rento cuarto' : 'Busco roomie'

              return (
                <Link key={listing.id} href={`/listings/${listing.id}`}>
                  <div className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                    {/* Foto principal */}
                    {Array.isArray(listing.image_urls) && listing.image_urls.length > 0 ? (
                      <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                        <ListingImage
                          src={listing.image_urls[0]}
                          alt={listing.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          wrapperClassName="h-full"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] w-full bg-neutral-100 flex items-center justify-center text-neutral-300">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="p-5">
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-brand/10 text-brand rounded-full text-sm font-medium">
                        {typeLabel}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{listing.title}</h3>
                    <p className="text-sm text-gray-500 mb-1">{listing.city}{listing.zone ? ` · ${listing.zone}` : ''}</p>
                    {listing.price_mxn && (
                      <p className="text-sm font-semibold text-neutral-800 mb-3">${listing.price_mxn.toLocaleString()} MXN/mes</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(listing.created_at).toLocaleDateString('es-MX')}
                    </p>
                    </div>{/* /p-5 */}
                  </div>
                </Link>
              )
            })}
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

