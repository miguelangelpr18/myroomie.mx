import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ContactButton from './ContactButton'
import LifestyleBadges from '../../components/LifestyleBadges'

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerSupabaseClient()

  // Obtener listing por id
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('*')
    .eq('id', params.id)
    .single()

  // Verificar si está featured
  const now = new Date()
  const isFeatured = listing?.featured_until && new Date(listing.featured_until) > now

  // Si no existe o hay error, mostrar error amigable
  if (!listing || listingError) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Anuncio no encontrado
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Es posible que este anuncio haya sido eliminado o ya no esté disponible.
          </p>
          <Link
            href="/listings"
            className="inline-block bg-[#FF7A18] text-white px-6 py-2 rounded-lg hover:bg-[#E86F14] text-sm font-medium"
          >
            Ver anuncios
          </Link>
        </div>
      </div>
    )
  }

  // Obtener perfil del autor
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, city, zone, pets, smoker, cleanliness, parties, schedule')
    .eq('user_id', listing.user_id)
    .single()

  const typeLabel = listing.listing_type === 'room' ? 'Rento cuarto' : 'Busco roomie'
  const initial = profile?.display_name?.charAt(0).toUpperCase() || '?'

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/listings"
          className="text-[#FF7A18] hover:underline text-sm"
        >
          ← Volver a listings
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-block px-3 py-1 bg-[#FF7A18]/10 text-[#FF7A18] rounded-full text-sm font-medium">
            {typeLabel}
          </span>
          {isFeatured && (
            <span className="inline-block px-3 py-1 bg-[#FF7A18] text-white rounded-full text-sm font-semibold">
              Destacado
            </span>
          )}
        </div>
        <h1 className="text-4xl font-bold mb-4">{listing.title}</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="space-y-3 mb-6">
          {listing.price_mxn && (
            <p className="text-2xl font-semibold text-[#FF7A18]">
              ${listing.price_mxn.toLocaleString()} MXN/mes
            </p>
          )}
          <div className="flex gap-4 text-gray-600">
            <p>
              <strong>Ciudad:</strong> {listing.city}
            </p>
            <p>
              <strong>Zona:</strong> {listing.zone}
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Publicado el {new Date(listing.created_at).toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-3">Descripción</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Publicado por</h2>
        {profile ? (
          <Link href={`/profiles/${listing.user_id}`}>
            <div className="flex items-center gap-4 mb-4 cursor-pointer hover:opacity-80 transition-opacity">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#FF7A18] text-white flex items-center justify-center text-xl font-semibold">
                  {initial}
                </div>
              )}
              <div>
                <p className="font-semibold text-lg">{profile.display_name}</p>
                <p className="text-sm text-gray-600">
                  {profile.city}, {profile.zone}
                </p>
                <LifestyleBadges profile={profile} />
              </div>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[#FF7A18] text-white flex items-center justify-center text-xl font-semibold">
              {initial}
            </div>
            <div>
              <p className="font-semibold text-lg">Usuario</p>
              <p className="text-sm text-gray-500 italic">Información del autor no disponible</p>
            </div>
          </div>
        )}
        <ContactButton listingUserId={listing.user_id} listingId={listing.id} />
      </div>
    </div>
  )
}

