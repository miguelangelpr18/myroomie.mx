import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import EmptyState from '../components/ui/EmptyState'
import RoomieCard from '../components/roomies/RoomieCard'

interface ExplorePageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Explore({ searchParams }: ExplorePageProps) {
  const supabase = createServerSupabaseClient()

  // Extraer parámetros de búsqueda (del GlobalSearchBar mode roomies)
  const q = typeof searchParams.q === 'string' ? searchParams.q : ''
  const city = typeof searchParams.city === 'string' ? searchParams.city : ''
  // Nota: budget_min/budget_max no existen en profiles table, se ignoran silenciosamente

  // Extraer parámetros legacy de lifestyle (compatibilidad con URLs viejas, sin UI)
  const petsParam = typeof searchParams.pets === 'string' ? searchParams.pets : ''
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

  // Aplicar filtros legacy de lifestyle (solo si vienen en URL)
  if (petsParam === 'yes') {
    query = query.eq('pets', true)
  } else if (petsParam === 'no') {
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

  // Construir resumen de filtros activos
  const activeFilters: string[] = []
  if (q.trim()) activeFilters.push(`buscar: "${q.trim()}"`)
  if (city.trim()) activeFilters.push(`ciudad: ${city.trim()}`)
  // Nota: No mostrar lifestyle filters en resumen (son legacy, sin UI)
  // Nota: budget_min/budget_max no existen en profiles table, se ignoran silenciosamente

  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Explora perfiles</h1>
          <p className="text-gray-600 text-sm">Encuentra roomies que compartan tu estilo de vida.</p>
        </div>
        <Link
          href="/onboarding/step-1"
          className="bg-[#FF7A18] text-white px-4 py-2 rounded-lg hover:bg-[#E86F14]"
        >
          Crear/editar mi perfil
        </Link>
      </div>

      {/* Resumen de resultados y filtros activos */}
      {(activeFilters.length > 0 || resultCount > 0) && (
        <div className="mb-6">
          <p className="text-gray-600 text-sm">
            Mostrando <strong>{resultCount}</strong> {resultCount === 1 ? 'perfil' : 'perfiles'}
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
          Error al cargar perfiles: {error.message}
        </div>
      )}

      {!profiles || profiles.length === 0 ? (
        activeFilters.length > 0 ? (
          <EmptyState
            icon="search"
            title="No encontramos roomies con esos filtros"
            description="Intenta cambiar la ciudad o quitar algunos filtros."
            ctaLabel="Ver todos"
            ctaHref="/explore"
          />
        ) : (
          <EmptyState
            icon="search"
            title="Aún no hay perfiles"
            description="Sé el primero en crear tu perfil y conectar con otros roomies."
            ctaLabel="Crear mi perfil"
            ctaHref="/onboarding/step-1"
          />
        )
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
