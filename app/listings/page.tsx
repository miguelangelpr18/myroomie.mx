import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Filters from './Filters'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'

interface ListingsPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Listings({ searchParams }: ListingsPageProps) {
  const supabase = createServerSupabaseClient()

  // Obtener sesión para verificar si está logueado (para mostrar botón crear)
  const { data: { session } } = await supabase.auth.getSession()

  // Extraer parámetros de búsqueda
  const q = typeof searchParams.q === 'string' ? searchParams.q : ''
  const city = typeof searchParams.city === 'string' ? searchParams.city : ''
  const zone = typeof searchParams.zone === 'string' ? searchParams.zone : ''
  const listingType = typeof searchParams.listing_type === 'string' ? searchParams.listing_type : 'all'
  const minPrice = typeof searchParams.min === 'string' ? searchParams.min : ''
  const maxPrice = typeof searchParams.max === 'string' ? searchParams.max : ''
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'recent'

  // Construir query base
  let query = supabase
    .from('listings')
    .select('id, title, description, city, zone, price_mxn, listing_type, created_at, featured_until')

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

  // Ordenar por featured_until desc nulls last primero (featured primero)
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

  // Ordenar listings: featured primero (featured_until > now), luego mantener orden de Supabase
  const now = new Date()
  const sortedListings = listings
    ? [...listings].sort((a, b) => {
        const aFeatured = a.featured_until && new Date(a.featured_until) > now
        const bFeatured = b.featured_until && new Date(b.featured_until) > now

        // Si uno es featured y el otro no, featured va primero
        if (aFeatured && !bFeatured) return -1
        if (!aFeatured && bFeatured) return 1

        // Si ambos son featured, ordenar por featured_until desc
        if (aFeatured && bFeatured) {
          const aDate = new Date(a.featured_until!).getTime()
          const bDate = new Date(b.featured_until!).getTime()
          return bDate - aDate
        }

        // Si ninguno es featured, mantener orden original (ya viene ordenado por Supabase según sort param)
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

      <Filters />

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
          {sortedListings?.map((listing) => {
            const typeLabel = listing.listing_type === 'room' ? 'Rento cuarto' : 'Busco roomie'
            const now = new Date()
            const isFeatured = listing.featured_until && new Date(listing.featured_until) > now

            return (
              <Link 
                key={listing.id} 
                href={`/listings/${listing.id}`}
                className="rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="subtle">{typeLabel}</Badge>
                        {isFeatured && <Badge variant="featured">Destacado</Badge>}
                      </div>
                    </div>
                    <h2 className="text-base md:text-lg font-medium mb-1">{listing.title}</h2>
                    <p className="text-xs text-neutral-500">
                      {listing.city} · {listing.zone}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-700 line-clamp-3 mb-3">{listing.description}</p>
                    {listing.price_mxn && (
                      <p className="text-sm font-medium text-neutral-900 mb-2">
                        ${listing.price_mxn.toLocaleString()} MXN/mes
                      </p>
                    )}
                    <p className="text-xs text-neutral-400">
                      {new Date(listing.created_at).toLocaleDateString('es-MX')}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
