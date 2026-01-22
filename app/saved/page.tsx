import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuthOrRedirect } from '@/lib/requireAuth'
import EmptyState from '../components/ui/EmptyState'
import ListingCard from '../components/listings/ListingCard'

export default async function SavedPage() {
  // Requerir autenticación (wishlist es privada)
  await requireAuthOrRedirect()

  const supabase = createServerSupabaseClient()

  // Obtener sesión para user_id
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (!session || sessionError) {
    // requireAuthOrRedirect ya debería haber redirigido, pero por seguridad:
    return null
  }

  const userId = session.user.id

  // FALLBACK B: 2 queries (más robusto que join en Supabase)
  // 1) Traer listing_ids de listing_saves del usuario (order por created_at desc)
  const { data: saves, error: savesError } = await supabase
    .from('listing_saves')
    .select('listing_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (savesError) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          Error al cargar guardados: {savesError.message}
        </div>
      </div>
    )
  }

  // Si no hay saves, mostrar empty state
  if (!saves || saves.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Guardados</h1>
          <p className="text-gray-600 text-sm">Tus anuncios guardados para comparar después.</p>
        </div>
        <EmptyState
          icon="listings"
          title="Aún no has guardado anuncios"
          description="Guarda anuncios para compararlos y contactarlos después."
          ctaLabel="Explorar anuncios"
          ctaHref="/listings"
        />
      </div>
    )
  }

  // 2) Query a listings con .in('id', listingIds)
  const listingIds = saves.map((save) => save.listing_id)
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('id, title, description, city, zone, price_mxn, listing_type, created_at, featured_until, image_urls')
    .in('id', listingIds)

  if (listingsError) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          Error al cargar anuncios: {listingsError.message}
        </div>
      </div>
    )
  }

  // 3) Re-ordenar en memoria según el orden original de saves (para que se sienta correcto)
  // Crear un mapa de listing_id -> índice en saves (orden de guardado)
  const saveOrderMap = new Map<string, number>()
  saves.forEach((save, index) => {
    saveOrderMap.set(save.listing_id, index)
  })

  // Ordenar listings según el orden de saves
  const sortedListings = listings
    ? [...listings].sort((a, b) => {
        const aOrder = saveOrderMap.get(a.id) ?? Infinity
        const bOrder = saveOrderMap.get(b.id) ?? Infinity
        return aOrder - bOrder
      })
    : []

  // Calcular número de resultados
  const resultCount = sortedListings.length

  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Guardados</h1>
        <p className="text-gray-600 text-sm">Tus anuncios guardados para comparar después.</p>
      </div>

      {/* Resumen de resultados */}
      {resultCount > 0 && (
        <div className="mb-6">
          <p className="text-gray-600 text-sm">
            Mostrando <strong>{resultCount}</strong> {resultCount === 1 ? 'anuncio guardado' : 'anuncios guardados'}
          </p>
        </div>
      )}

      {/* Grid de listings */}
      {sortedListings.length === 0 ? (
        <EmptyState
          icon="listings"
          title="Aún no has guardado anuncios"
          description="Guarda anuncios para compararlos y contactarlos después."
          ctaLabel="Explorar anuncios"
          ctaHref="/listings"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {sortedListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              href={`/listings/${listing.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}


