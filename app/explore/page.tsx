import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import EmptyState from '../components/ui/EmptyState'
import RoomieCard from '../components/roomies/RoomieCard'
import FilterChips from './FilterChips'
import ResultHeader from './ResultHeader'

interface ExplorePageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Explore({ searchParams }: ExplorePageProps) {
  const supabase = createServerSupabaseClient()

  // Verificar si el usuario actual tiene perfil
  const { data: { session } } = await supabase.auth.getSession()
  let hasMyProfile = false
  
  if (session?.user) {
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', session.user.id)
      .maybeSingle()
    
    hasMyProfile = !!myProfile
  }

  // Extraer parámetros de búsqueda (del GlobalSearchBar mode roomies)
  const q = typeof searchParams.q === 'string' ? searchParams.q : ''
  const city = typeof searchParams.city === 'string' ? searchParams.city : ''
  // Nota: budget_min/budget_max no existen en profiles table, se ignoran silenciosamente

  // Extraer parámetros de chips (filtros booleanos)
  const featuredParam = typeof searchParams.featured === 'string' ? searchParams.featured : ''
  const petsChipParam = typeof searchParams.pets === 'string' ? searchParams.pets : ''
  const noSmokerParam = typeof searchParams.no_smoker === 'string' ? searchParams.no_smoker : ''
  const calmParam = typeof searchParams.calm === 'string' ? searchParams.calm : ''

  // Extraer parámetros legacy de lifestyle (compatibilidad con URLs viejas, sin UI)
  // Nota: pets legacy usa 'yes'/'no', chips usa '1', así que no hay conflicto
  const petsLegacyParam = typeof searchParams.pets === 'string' ? searchParams.pets : ''
  const smokerParam = typeof searchParams.smoker === 'string' ? searchParams.smoker : ''
  const partiesParam = typeof searchParams.parties === 'string' ? searchParams.parties : ''
  const cleanlinessParam = typeof searchParams.cleanliness === 'string' ? searchParams.cleanliness : ''
  const scheduleParam = typeof searchParams.schedule === 'string' ? searchParams.schedule : ''

  // Construir query base (sin budget_min/budget_max - no existen en profiles table)
  let query = supabase
    .from('profiles')
    .select('user_id, display_name, city, zone, avatar_url, featured_until, pets, smoker, cleanliness, parties, schedule')

  // Aplicar filtro de búsqueda por nombre (q)
  if (q.trim()) {
    query = query.ilike('display_name', `%${q.trim()}%`)
  }

  // Aplicar filtro de ciudad
  if (city.trim()) {
    query = query.ilike('city', `%${city.trim()}%`)
  }

  // Aplicar filtros de chips (booleanos)
  // Featured: filtrar donde featured_until > now()
  if (featuredParam === '1') {
    const now = new Date().toISOString()
    query = query.gt('featured_until', now)
  }

  // Pets: filtrar donde pets = true
  if (petsChipParam === '1') {
    query = query.eq('pets', true)
  }

  // No smoker: filtrar donde smoker = false
  if (noSmokerParam === '1') {
    query = query.eq('smoker', false)
  }

  // Calm (tranquilo): filtrar donde parties = false
  if (calmParam === '1') {
    query = query.eq('parties', false)
  }

  // Aplicar filtros legacy de lifestyle (solo si vienen en URL, compatibilidad)
  // Nota: Solo aplicar legacy si NO es un valor de chip (pets=1 es chip, pets=yes/no es legacy)
  if (petsLegacyParam === 'yes' && petsChipParam !== '1') {
    query = query.eq('pets', true)
  } else if (petsLegacyParam === 'no' && petsChipParam !== '1') {
    query = query.eq('pets', false)
  }

  if (smokerParam === 'yes') {
    query = query.eq('smoker', true)
  } else if (smokerParam === 'no') {
    query = query.eq('smoker', false)
  }

  if (partiesParam === 'yes') {
    query = query.eq('parties', true)
  } else if (partiesParam === 'no') {
    query = query.eq('parties', false)
  }

  if (cleanlinessParam === '1' || cleanlinessParam === '2' || cleanlinessParam === '3') {
    query = query.eq('cleanliness', parseInt(cleanlinessParam, 10))
  }

  if (scheduleParam === 'day' || scheduleParam === 'night') {
    query = query.eq('schedule', scheduleParam)
  }

  // Ordenar: destacados primero (featured_until > now), luego más recientes
  query = query.order('featured_until', { ascending: false, nullsFirst: false })
  query = query.order('created_at', { ascending: false })

  // Limitar resultados
  query = query.limit(50)

  // Ejecutar query
  const { data: profiles, error } = await query

  // Ordenar perfiles: featured primero (featured_until > now), luego mantener orden de Supabase
  const now = new Date()
  const sortedProfiles = profiles
    ? [...profiles].sort((a, b) => {
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

        // Si ninguno es featured, mantener orden original (ya viene ordenado por Supabase)
        return 0
      })
    : null

  // Calcular número de resultados
  const resultCount = sortedProfiles?.length || 0

  // Construir objeto de filtros activos para ResultHeader
  const activeFilters = {
    featured: featuredParam === '1',
    pets: petsChipParam === '1',
    no_smoker: noSmokerParam === '1',
    calm: calmParam === '1',
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-3">
        <div className="max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-medium tracking-[-0.01em] text-neutral-900">Explora perfiles</h1>
          <p className="text-neutral-700 text-sm mt-1">Encuentra roomies que compartan tu estilo de vida.</p>
        </div>
        {!hasMyProfile && (
          <Link
            href="/onboarding/step-1"
            className="inline-flex items-center justify-center bg-brand text-white h-10 px-4 rounded-lg text-sm font-medium leading-none hover:bg-brandHover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A18]/30 focus-visible:ring-offset-2"
          >
            Crear mi perfil
          </Link>
        )}
      </div>

      {/* Divider */}
      <div className="mt-5 mb-4 h-px w-full bg-black/5" />

      {/* Chips de filtros */}
      <FilterChips />

      {/* Result Header */}
      {resultCount > 0 && (
        <ResultHeader
          count={resultCount}
          activeFilters={activeFilters}
          hasSearch={!!q.trim()}
          searchQuery={q.trim() || undefined}
          hasCity={!!city.trim()}
          cityName={city.trim() || undefined}
        />
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6">
          Error al cargar perfiles: {error.message}
        </div>
      )}

      {!profiles || profiles.length === 0 ? (
        (Object.values(activeFilters).some(Boolean) || q.trim() || city.trim()) ? (
          <div className="py-12">
            <EmptyState
              icon="search"
              title="No encontramos perfiles con esos filtros"
              description={
                q.trim()
                  ? 'Prueba quitar un filtro o ajustar tu búsqueda. Intenta otro nombre o solo una palabra.'
                  : 'Prueba quitar un filtro o ajustar tu búsqueda.'
              }
              ctaLabel="Limpiar filtros"
              ctaHref="/explore"
            />
          </div>
        ) : (
          <div className="py-12">
            <EmptyState
              icon="search"
              title="Aún no hay perfiles"
              description="Sé el primero en crear tu perfil y conectar con otros roomies."
              ctaLabel="Crear mi perfil"
              ctaHref="/onboarding/step-1"
            />
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {sortedProfiles?.map((profile) => (
            <RoomieCard
              key={profile.user_id}
              profile={profile}
              href={`/profiles/${profile.user_id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
