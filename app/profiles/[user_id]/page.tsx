import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireProfileOrRedirect } from '@/lib/requireProfile'
import Link from 'next/link'
import LifestyleBadges from '../../components/LifestyleBadges'
import ContactButton from './ContactButton'
import TrustPanel from '../../components/TrustPanel'

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
            className="inline-block bg-[#FF7A18] text-white px-6 py-2 rounded-lg hover:bg-[#E86F14] text-sm font-medium"
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
    .select('id, title, city, zone, price_mxn, listing_type, created_at')
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
          className="text-[#FF7A18] hover:underline text-sm"
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
            <div className="w-24 h-24 rounded-full bg-[#FF7A18] text-white flex items-center justify-center text-3xl font-semibold">
              {initial}
            </div>
          )}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{profile.display_name}</h1>
              {isFeatured && (
                <span className="inline-block px-3 py-1 bg-[#FF7A18] text-white rounded-full text-sm font-semibold">
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
        {!isOwnProfile && <ContactButton userId={profile.user_id} />}
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
                  <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-[#FF7A18]/10 text-[#FF7A18] rounded-full text-sm font-medium">
                        {typeLabel}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{listing.title}</h3>
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <p>
                        <strong>Ciudad:</strong> {listing.city}
                      </p>
                      <p>
                        <strong>Zona:</strong> {listing.zone}
                      </p>
                      {listing.price_mxn && (
                        <p>
                          <strong>Precio:</strong> ${listing.price_mxn.toLocaleString()} MXN/mes
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(listing.created_at).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

