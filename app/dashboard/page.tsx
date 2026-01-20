import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuthOrRedirect } from '@/lib/requireAuth'
import Link from 'next/link'

export default async function DashboardPage() {
  await requireAuthOrRedirect()

  const supabase = createServerSupabaseClient()

  // Obtener sesión
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return null
  }

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url, featured_until')
    .eq('user_id', session.user.id)
    .maybeSingle()

  // Obtener listings del usuario
  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, city, zone, price_mxn, listing_type, created_at, featured_until')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const initial = profile?.display_name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || '?'
  const now = new Date()
  const isFeatured = profile?.featured_until && new Date(profile.featured_until) > now

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Card: Your profile */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your profile</h2>
          
          {profile ? (
            <>
              <div className="flex items-center gap-4 mb-4">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#FF7A18] text-white flex items-center justify-center text-2xl font-semibold">
                    {initial}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-lg">{profile.display_name}</p>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium mt-1">
                    Active
                  </span>
                </div>
              </div>
              {isFeatured && profile.featured_until && (
                <div className="mb-4 p-3 bg-[#FF7A18]/10 border border-[#FF7A18] rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong className="text-[#FF7A18]">Promoción activa hasta:</strong>{' '}
                    {new Date(profile.featured_until).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
              {!isFeatured && (
                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600">No tienes promoción activa</p>
                </div>
              )}
              <div className="flex gap-2">
                <Link
                  href={`/profiles/${session.user.id}`}
                  className="flex-1 bg-[#FF7A18] text-white px-4 py-2 rounded-lg hover:bg-[#E86F14] text-sm font-medium text-center"
                >
                  Ver mi perfil
                </Link>
                <Link
                  href="/promote/profile"
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium text-center"
                >
                  Promocionar perfil (Roomies)
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Aún no has completado tu perfil</p>
              <Link
                href="/onboarding/step-1"
                className="inline-block bg-[#FF7A18] text-white px-6 py-2 rounded-lg hover:bg-[#E86F14] text-sm font-medium"
              >
                Completar perfil
              </Link>
            </div>
          )}
        </div>

        {/* Card: Your listings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your listings</h2>
          
          {!listings || listings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Aún no has creado ningún listing</p>
              <Link
                href="/listings/new"
                className="inline-block bg-[#FF7A18] text-white px-6 py-2 rounded-lg hover:bg-[#E86F14] text-sm font-medium"
              >
                Crear listing
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => {
                const typeLabel = listing.listing_type === 'room' ? 'Rento cuarto' : 'Busco roomie'
                const now = new Date()
                const isFeatured = listing.featured_until && new Date(listing.featured_until) > now
                return (
                  <div
                    key={listing.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <Link href={`/listings/${listing.id}`} className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-block px-2 py-1 bg-[#FF7A18]/10 text-[#FF7A18] rounded text-xs font-medium">
                            {typeLabel}
                          </span>
                          {isFeatured && (
                            <span className="inline-block px-2 py-1 bg-[#FF7A18] text-white rounded text-xs font-semibold">
                              Destacado
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold mb-1">{listing.title}</h3>
                        <p className="text-sm text-gray-600">
                          {listing.city}, {listing.zone}
                        </p>
                        {listing.price_mxn && (
                          <p className="text-sm font-medium text-gray-800 mt-1">
                            ${listing.price_mxn.toLocaleString()} MXN/mes
                          </p>
                        )}
                        {isFeatured && listing.featured_until && (
                          <p className="text-xs text-[#FF7A18] mt-2">
                            Destacado hasta:{' '}
                            {new Date(listing.featured_until).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        )}
                      </Link>
                      <Link
                        href={`/promote/listing/${listing.id}`}
                        className="bg-[#FF7A18] text-white px-4 py-2 rounded-lg hover:bg-[#E86F14] text-sm font-medium whitespace-nowrap"
                      >
                        Promocionar anuncio
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Card: Verifications */}
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-semibold mb-4">Verifications</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
            <div>
              <p className="font-medium">Verify phone</p>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
            <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm cursor-not-allowed">
              Verify
            </button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
            <div>
              <p className="font-medium">Verify ID</p>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
            <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm cursor-not-allowed">
              Verify
            </button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
            <div>
              <p className="font-medium">Social media</p>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
            <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm cursor-not-allowed">
              Verify
            </button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
            <div>
              <p className="font-medium">Credit check</p>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
            <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm cursor-not-allowed">
              Verify
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

