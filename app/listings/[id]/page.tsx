import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import LifestyleBadges from '../../components/LifestyleBadges'
import ListingGallery from '../../components/listings/ListingGallery'
import { getOrCreateListingThread } from './actions'
import ContactForm from './ContactForm'
import SaveButton from './SaveButton'
import OwnerActions from './OwnerActions'
import ReportButton from '../../components/ReportButton'
import type { Metadata } from 'next'
import { formatDate } from '@/lib/utils/formatDate'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const supabase = createServerSupabaseClient()
  const { data: listing } = await supabase
    .from('listings')
    .select('title, city, description, image_urls')
    .eq('id', params.id)
    .single()

  if (!listing) {
    return { title: 'Anuncio no encontrado' }
  }

  const title = `${listing.title} en ${listing.city}`
  const description = listing.description?.slice(0, 160) ?? `Habitación en renta en ${listing.city} — MyRoomie.mx`
  const imageUrl = Array.isArray(listing.image_urls) && listing.image_urls[0]
    ? listing.image_urls[0]
    : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : [],
      url: `https://www.myroomie.mx/listings/${params.id}`,
      type: 'website',
    },
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerSupabaseClient()

  // Obtener sesión para verificar si es el owner
  const { data: { user } } = await supabase.auth.getUser()
  const viewerId = user?.id

  // Obtener listing por id
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('*')
    .eq('id', params.id)
    .single()

  // Obtener perfil del owner (query separada para mayor control)
  let profile = null
  if (listing && listing.user_id) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('user_id, display_name, city, zone, avatar_url, pets, smoker, cleanliness, parties, schedule')
      .eq('user_id', listing.user_id)
      .single()
    profile = profileData
  }

  // Verificar si está guardado (si hay sesión)
  let isSaved = false
  if (viewerId) {
    const { data: save } = await supabase
      .from('listing_saves')
      .select('id')
      .eq('user_id', viewerId)
      .eq('listing_id', listing.id)
      .maybeSingle()
    isSaved = !!save
  }

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
            className="inline-block bg-brand text-white px-6 py-2 rounded-lg hover:bg-brandHover text-sm font-medium"
          >
            Ver anuncios
          </Link>
        </div>
      </div>
    )
  }

  const typeLabel = listing.listing_type === 'room' ? 'Rento cuarto' : 'Busco roomie'
  const initial = profile?.display_name?.charAt(0).toUpperCase() || '?'
  const isOwner = viewerId === listing.user_id

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="mb-6">
        <Link
          href="/listings"
          className="text-brand hover:underline text-sm"
        >
          ← Volver a anuncios
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-block px-3 py-1 bg-brand/10 text-brand rounded-full text-sm font-medium">
            {typeLabel}
          </span>
          {isFeatured && (
            <span className="inline-block px-3 py-1 bg-brand text-white rounded-full text-sm font-semibold">
              Destacado
            </span>
          )}
        </div>
        <h1 className="text-4xl font-bold mb-4">{listing.title}</h1>
        
        {/* Jerarquía: Precio, Ubicación, Fecha */}
        <div className="space-y-2 mb-4">
          {listing.price_mxn && (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-neutral-900">
                ${listing.price_mxn.toLocaleString()}
              </span>
              <span className="text-base text-neutral-600">MXN/mes</span>
            </div>
          )}
          {(listing.city || listing.zone) && (
            <p className="text-base text-neutral-700">
              {listing.city}{listing.zone ? ` · ${listing.zone}` : ''}
            </p>
          )}
          <p className="text-sm text-neutral-500">
            Publicado el {formatDate(listing.created_at)}
          </p>
        </div>
      </div>

      {/* Galería de imágenes con carousel y lightbox */}
      <ListingGallery
        photos={Array.isArray(listing.image_urls) ? listing.image_urls : []}
        title={listing.title}
      />

      {/* Layout: main + side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-3">Descripción</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
            </div>
          </div>

          {/* Amenidades */}
          {Array.isArray(listing.amenities) && listing.amenities.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Lo que incluye este espacio</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(listing.amenities as string[]).map((amenity: string) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 p-3 rounded-xl border border-neutral-200 bg-neutral-50"
                  >
                    <span className="text-brand">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-neutral-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow lg:sticky lg:top-6">
            {/* CTA Stack */}
            <div className="space-y-3 mb-6">
              {isOwner ? (
                <OwnerActions
                  listingId={listing.id}
                  isActive={listing.is_active !== false}
                />
              ) : (
                <>
                  {/* Botón Primary: Contactar */}
                  <ContactForm 
                    listingId={listing.id}
                    isOwner={isOwner}
                    hasSession={!!viewerId}
                  />

                  {/* Botón Secondary: Guardar */}
                  <SaveButton
                    listingId={listing.id}
                    isSaved={isSaved}
                    hasSession={!!viewerId}
                  />
                </>
              )}
            </div>

            {/* Microcopy de confianza (solo para no-owner) */}
            {!isOwner && (
            <div className="pt-4 border-t space-y-1 mb-6">
              <p className="text-xs text-neutral-600">Verificación: en proceso</p>
            </div>
            )}

            {/* Publicado por */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Publicado por</h2>
              {profile ? (
                <Link href={`/profiles/${listing.user_id}`}>
                  <div className="flex items-start gap-4 mb-4 cursor-pointer hover:opacity-80 transition-opacity">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.display_name}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-brandSoft text-brandText border border-brandBorder flex items-center justify-center text-xl font-semibold flex-shrink-0">
                        {initial}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lg">{profile.display_name}</p>
                      <p className="text-sm text-gray-600">
                        {profile.city || 'Ciudad no especificada'} · {profile.zone || 'Zona no especificada'}
                      </p>
                      <LifestyleBadges profile={profile} />
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-brandSoft text-brandText border border-brandBorder flex items-center justify-center text-xl font-semibold flex-shrink-0">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg">Usuario</p>
                    <p className="text-sm text-gray-500 italic">Información del autor no disponible</p>
                  </div>
                </div>
              )}
              
              {/* Link Ver perfil */}
              {profile && (
                <Link
                  href={`/profiles/${listing.user_id}`}
                  className="block w-full text-center text-sm font-medium text-brand hover:text-brandHover"
                >
                  Ver perfil →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reportar */}
      {!isOwner && (
        <div className="mt-6 flex justify-center">
          <ReportButton reportedType="listing" reportedId={listing.id} />
        </div>
      )}
    </div>
  )
}

