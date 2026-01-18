import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireProfileOrRedirect } from '@/lib/requireProfile'
import Link from 'next/link'
import Filters from './Filters'
import LifestyleBadges from '../components/LifestyleBadges'
import ContactButton from './ContactButton'

interface ExplorePageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Explore({ searchParams }: ExplorePageProps) {
  // Verificar que el usuario tenga perfil
  await requireProfileOrRedirect()

  const supabase = createServerSupabaseClient()

  // Obtener sesión para verificar si es el propio perfil (para ocultar botón Contactar)
  const { data: { session } } = await supabase.auth.getSession()

  // Extraer parámetros de búsqueda
  const q = typeof searchParams.q === 'string' ? searchParams.q : ''
  const city = typeof searchParams.city === 'string' ? searchParams.city : ''
  const zone = typeof searchParams.zone === 'string' ? searchParams.zone : ''

  // Extraer parámetros de lifestyle
  const petsParam = typeof searchParams.pets === 'string' ? searchParams.pets : ''
  const smokerParam = typeof searchParams.smoker === 'string' ? searchParams.smoker : ''
  const partiesParam = typeof searchParams.parties === 'string' ? searchParams.parties : ''
  const cleanlinessParam = typeof searchParams.cleanliness === 'string' ? searchParams.cleanliness : ''
  const scheduleParam = typeof searchParams.schedule === 'string' ? searchParams.schedule : ''

  // Construir query base
  let query = supabase
    .from('profiles')
    .select('user_id, display_name, city, zone, avatar_url, pets, smoker, cleanliness, parties, schedule')

  // Aplicar filtro de búsqueda por nombre (q)
  if (q.trim()) {
    query = query.ilike('display_name', `%${q.trim()}%`)
  }

  // Aplicar filtro de ciudad
  if (city.trim()) {
    query = query.ilike('city', `%${city.trim()}%`)
  }

  // Aplicar filtro de zona
  if (zone.trim()) {
    query = query.ilike('zone', `%${zone.trim()}%`)
  }

  // Aplicar filtros de lifestyle
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

  // Ordenar por fecha de creación (más recientes primero)
  query = query.order('created_at', { ascending: false })

  // Limitar resultados
  query = query.limit(50)

  // Ejecutar query
  const { data: profiles, error } = await query

  // Calcular número de resultados
  const resultCount = profiles?.length || 0

  // Construir resumen de filtros activos
  const activeFilters: string[] = []
  if (q.trim()) activeFilters.push(`buscar: "${q.trim()}"`)
  if (city.trim()) activeFilters.push(`ciudad: ${city.trim()}`)
  if (zone.trim()) activeFilters.push(`zona: ${zone.trim()}`)
  if (petsParam === 'yes') activeFilters.push('con mascotas')
  if (petsParam === 'no') activeFilters.push('sin mascotas')
  if (smokerParam === 'yes') activeFilters.push('fuma')
  if (smokerParam === 'no') activeFilters.push('no fuma')
  if (partiesParam === 'yes') activeFilters.push('fiestero')
  if (partiesParam === 'no') activeFilters.push('tranquilo')
  if (cleanlinessParam === '1') activeFilters.push('limpieza: relax')
  if (cleanlinessParam === '2') activeFilters.push('limpieza: normal')
  if (cleanlinessParam === '3') activeFilters.push('limpieza: muy limpio')
  if (scheduleParam === 'day') activeFilters.push('día')
  if (scheduleParam === 'night') activeFilters.push('noche')

  // Helper para construir URLs preservando params existentes
  function buildHref(overrides: Partial<Record<string, string | null>>): string {
    const params = new URLSearchParams()
    
    // Preservar params existentes (búsqueda básica)
    if (q.trim()) params.set('q', q.trim())
    if (city.trim()) params.set('city', city.trim())
    if (zone.trim()) params.set('zone', zone.trim())
    
    // Preservar params de lifestyle existentes (a menos que sean overriden)
    if (!overrides.hasOwnProperty('pets') && petsParam) params.set('pets', petsParam)
    if (!overrides.hasOwnProperty('smoker') && smokerParam) params.set('smoker', smokerParam)
    if (!overrides.hasOwnProperty('parties') && partiesParam) params.set('parties', partiesParam)
    if (!overrides.hasOwnProperty('cleanliness') && cleanlinessParam) params.set('cleanliness', cleanlinessParam)
    if (!overrides.hasOwnProperty('schedule') && scheduleParam) params.set('schedule', scheduleParam)
    
    // Aplicar overrides (null = remover, string = setear)
    Object.entries(overrides).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key)
      } else if (value) {
        params.set(key, value)
      }
    })

    const queryString = params.toString()
    return queryString ? `/explore?${queryString}` : '/explore'
  }

  // Verificar si hay filtros de lifestyle activos
  const hasLifestyleFilters = petsParam || smokerParam || partiesParam || cleanlinessParam || scheduleParam

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Explora perfiles</h1>
          <p className="text-gray-600 text-sm">Filtra por ciudad, zona y estilo de vida.</p>
        </div>
        <Link
          href="/onboarding/step-1"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Crear/editar mi perfil
        </Link>
      </div>

      <Filters />

      {/* Filtros de Lifestyle (chips toggle SSR-friendly) */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-sm font-medium mb-4 text-gray-700">Estilo de vida</h3>
        
        <div className="space-y-4">
          {/* Mascotas */}
          <div>
            <p className="text-xs text-gray-600 mb-2">Mascotas</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildHref({ pets: 'yes' })}
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  petsParam === 'yes'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Con mascotas
              </Link>
              <Link
                href={buildHref({ pets: 'no' })}
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  petsParam === 'no'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Sin mascotas
              </Link>
            </div>
          </div>

          {/* Fuma */}
          <div>
            <p className="text-xs text-gray-600 mb-2">Fuma</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildHref({ smoker: 'yes' })}
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  smokerParam === 'yes'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Fuma
              </Link>
              <Link
                href={buildHref({ smoker: 'no' })}
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  smokerParam === 'no'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                No fuma
              </Link>
            </div>
          </div>

          {/* Plan */}
          <div>
            <p className="text-xs text-gray-600 mb-2">Plan</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildHref({ parties: 'yes' })}
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  partiesParam === 'yes'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Fiestero
              </Link>
              <Link
                href={buildHref({ parties: 'no' })}
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  partiesParam === 'no'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Tranquilo
              </Link>
            </div>
          </div>

          {/* Limpieza */}
          <div>
            <p className="text-xs text-gray-600 mb-2">Limpieza</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildHref({ cleanliness: '1' })}
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  cleanlinessParam === '1'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Relax (1)
              </Link>
              <Link
                href={buildHref({ cleanliness: '2' })}
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  cleanlinessParam === '2'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Normal (2)
              </Link>
              <Link
                href={buildHref({ cleanliness: '3' })}
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  cleanlinessParam === '3'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Muy limpio (3)
              </Link>
            </div>
          </div>

          {/* Horario */}
          <div>
            <p className="text-xs text-gray-600 mb-2">Horario</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildHref({ schedule: 'day' })}
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  scheduleParam === 'day'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Día
              </Link>
              <Link
                href={buildHref({ schedule: 'night' })}
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  scheduleParam === 'night'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Noche
              </Link>
            </div>
          </div>
        </div>

        {/* Botón Limpiar (solo si hay lifestyle filters activos) */}
        {hasLifestyleFilters && (
          <div className="mt-4 pt-4 border-t">
            <Link
              href={buildHref({ pets: null, smoker: null, parties: null, cleanliness: null, schedule: null })}
              className="text-blue-600 hover:underline text-sm"
            >
              Limpiar filtros de lifestyle
            </Link>
          </div>
        )}
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
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {activeFilters.length > 0
              ? 'No encontramos perfiles con estos filtros'
              : 'Aún no hay perfiles'}
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            {activeFilters.length > 0
              ? 'Prueba ajustando los filtros o quitando algunos criterios.'
              : 'Sé el primero en crear tu perfil'}
          </p>
          {activeFilters.length > 0 ? (
            <Link
              href="/explore"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Limpiar filtros
            </Link>
          ) : (
            <Link
              href="/onboarding/step-1"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Crear mi perfil
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => {
            const initial = profile.display_name.charAt(0).toUpperCase()

            return (
              <Link key={profile.user_id} href={`/profiles/${profile.user_id}`}>
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
                <div className="mb-4">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-semibold">
                      {initial}
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-semibold mb-2">{profile.display_name}</h2>
                <p className="text-gray-600 mb-1">
                  <strong>Ciudad:</strong> {profile.city}
                </p>
                <p className="text-gray-600">
                  <strong>Zona:</strong> {profile.zone}
                </p>
                <LifestyleBadges profile={profile} />
                {session?.user?.id !== profile.user_id && (
                  <div className="mt-4 pt-4 border-t">
                    <ContactButton userId={profile.user_id} />
                  </div>
                )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
