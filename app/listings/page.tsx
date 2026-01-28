import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import EmptyState from '../components/ui/EmptyState'
import ListingCard from '../components/listings/ListingCard'

interface ListingsPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Listings({ searchParams }: ListingsPageProps) {
  const supabase = createServerSupabaseClient()

  // Obtener sesión para verificar si está logueado (para mostrar botón crear)
  const { data: { session } } = await supabase.auth.getSession()

  // Extraer parámetros de búsqueda
  const q = typeof searchParams.q === 'string' ? searchParams.q : ''
  const locationId = typeof searchParams.location_id === 'string' ? searchParams.location_id : undefined
  const cityParam = typeof searchParams.city === 'string' ? searchParams.city : ''
  const zone = typeof searchParams.zone === 'string' ? searchParams.zone : ''
  const listingType = typeof searchParams.listing_type === 'string' ? searchParams.listing_type : 'all'
  const minPrice = typeof searchParams.min === 'string' ? searchParams.min : ''
  const maxPrice = typeof searchParams.max === 'string' ? searchParams.max : ''
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'recent'

  // Resolver location_id a city si existe
  let city = cityParam
  if (locationId) {
    try {
      const { data: location } = await supabase
        .from('locations')
        .select('city, label')
        .eq('id', locationId)
        .single()

      if (location) {
        // Priorizar city, si es null usar label como fallback
        city = location.city || location.label || cityParam
      } else {
        // Si location_id no existe, fallback a city param si existe
        city = cityParam
      }
    } catch (error) {
      // Si hay error (ej: location_id inválido), fallback a city param
      console.error('Error al resolver location_id:', error)
      city = cityParam
    }
  }

  // Construir query base
  let query = supabase
    .from('listings')
    .select('id, title, description, city, zone, price_mxn, listing_type, created_at, featured_until, image_urls')

  // Aplicar filtro de búsqueda por texto (q)
  if (q.trim()) {
    query = query.or(`title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%`)
  }

  // Aplicar filtro de ciudad
  if (city.trim()) {
    query = query.ilike('city', `%${city.trim()}%`)
  }

  // Aplicar filtro de zona
  if (zone.trim()) {
    query = query.ilike('zone', `%${zone.trim()}%`)
  }

  // Aplicar filtro de tipo
  if (listingType !== 'all') {
    query = query.eq('listing_type', listingType)
  }

  // Aplicar filtro de precio mínimo
  if (minPrice.trim()) {
    const min = parseInt(minPrice.trim(), 10)
    if (!isNaN(min) && min >= 0) {
      query = query.gte('price_mxn', min)
    }
  }

  // Aplicar filtro de precio máximo
  if (maxPrice.trim()) {
    const max = parseInt(maxPrice.trim(), 10)
    if (!isNaN(max) && max >= 0) {
      query = query.lte('price_mxn', max)
    }
  }

  // Ordenar: destacados primero (featured_until > now), luego por sort param
  // Primero ordenar por featured_until desc (nulls last) para que destacados vayan primero
  query = query.order('featured_until', { ascending: false, nullsFirst: false })
  
  // Aplicar ordenamiento secundario según sort param
  if (sort === 'price_asc') {
    query = query.order('price_mxn', { ascending: true, nullsFirst: false })
  } else if (sort === 'price_desc') {
    query = query.order('price_mxn', { ascending: false, nullsFirst: false })
  } else {
    // sort === 'recent' (default)
    query = query.order('created_at', { ascending: false })
  }

  // Limitar resultados
  query = query.limit(50)

  // Ejecutar query
  const { data: listings, error } = await query

  // Ordenar listings: destacados primero (featured_until > now), luego mantener orden de Supabase
  const now = new Date()
  const sortedListings = listings
    ? [...listings].sort((a, b) => {
        // Verificar si está destacado: featured_until IS NOT NULL AND featured_until > now()
        const aFeatured = a.featured_until && new Date(a.featured_until) > now
        const bFeatured = b.featured_until && new Date(b.featured_until) > now

        // Si uno es destacado y el otro no, destacado va primero
        if (aFeatured && !bFeatured) return -1
        if (!aFeatured && bFeatured) return 1

        // Si ambos son destacados, ordenar por featured_until desc
        if (aFeatured && bFeatured) {
          const aDate = new Date(a.featured_until!).getTime()
          const bDate = new Date(b.featured_until!).getTime()
          return bDate - aDate
        }

        // Si ninguno es destacado, mantener orden original (ya viene ordenado por Supabase según sort param)
        return 0
      })
    : null

  // Calcular número de resultados
  const resultCount = sortedListings?.length || 0

  // Construir resumen de filtros activos
  const activeFilters: string[] = []
  if (q.trim()) activeFilters.push(`buscar: "${q.trim()}"`)
  if (city.trim()) activeFilters.push(`ciudad: ${city.trim()}`)
  if (zone.trim()) activeFilters.push(`zona: ${zone.trim()}`)
  if (listingType !== 'all') {
    activeFilters.push(`tipo: ${listingType === 'room' ? 'Rento cuarto' : 'Busco roomie'}`)
  }
  if (minPrice.trim()) activeFilters.push(`min: $${parseInt(minPrice, 10).toLocaleString()}`)
  if (maxPrice.trim()) activeFilters.push(`max: $${parseInt(maxPrice, 10).toLocaleString()}`)

  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Anuncios</h1>
          <p className="text-gray-600 text-sm">Cuartos disponibles y personas buscando roomie.</p>
        </div>
        <Link
          href="/listings/new"
          className="bg-[#FF7A18] text-white px-4 py-2 rounded-lg hover:bg-[#E86F14]"
        >
          Publicar anuncio
        </Link>
      </div>

      {/* Resumen de resultados y filtros activos */}
      {(activeFilters.length > 0 || resultCount > 0) && (
        <div className="mb-6">
          <p className="text-gray-600 text-sm">
            Mostrando <strong>{resultCount}</strong> {resultCount === 1 ? 'resultado' : 'resultados'}
            {activeFilters.length > 0 && (
              <span className="ml-2">
                • {activeFilters.join(' • ')}
              </span>
            )}
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6">
          Error al cargar listings: {error.message}
        </div>
      )}

      {!listings || listings.length === 0 ? (
        activeFilters.length > 0 ? (
          <EmptyState
            icon="listings"
            title="No hay anuncios con esos filtros"
            description="Intenta ampliar el rango de precio o cambiar la zona."
            ctaLabel="Ver todos"
            ctaHref="/listings"
          />
        ) : (
          <EmptyState
            icon="listings"
            title="Aún no hay anuncios publicados"
            description={session
              ? 'Sé el primero en publicar un cuarto o buscar roomie.'
              : 'Inicia sesión para crear un anuncio'}
            ctaLabel={session ? 'Publicar anuncio' : 'Iniciar sesión'}
            ctaHref={session ? '/listings/new' : '/login'}
          />
        )
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {sortedListings?.map((listing) => (
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
