import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import HomeFeaturedProfiles from './components/home/HomeFeaturedProfiles'
import HomeFeaturedListings from './components/home/HomeFeaturedListings'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MyRoomie.mx — Encuentra tu roomie ideal',
  description:
    'La plataforma para encontrar roommates y habitaciones en renta en México. Sin intermediarios, 100% gratis.',
}

async function getStats() {
  try {
    const supabase = createServerSupabaseClient()
    const [listingsRes, profilesRes] = await Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('user_id', { count: 'exact', head: true }),
    ])
    return {
      listings: listingsRes.count ?? 0,
      profiles: profilesRes.count ?? 0,
    }
  } catch {
    return { listings: 0, profiles: 0 }
  }
}

const CITIES = [
  { label: 'Monterrey', value: 'Monterrey' },
  { label: 'CDMX', value: 'Ciudad de México' },
  { label: 'Guadalajara', value: 'Guadalajara' },
  { label: 'Puebla', value: 'Puebla' },
  { label: 'Tijuana', value: 'Tijuana' },
]

export default async function Home() {
  const stats = await getStats()

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-white via-brand/5 to-white border-b border-neutral-100">
        <div className="mx-auto max-w-5xl px-4 md:px-8 pt-16 pb-14 md:pt-24 md:pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-brand/10 text-brand text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            100% gratis · Sin intermediarios
          </div>
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-semibold tracking-tight leading-[1.05] text-neutral-900 max-w-3xl mx-auto">
            Encuentra tu roomie ideal y tu próximo hogar
          </h1>
          <p className="mt-5 text-lg text-neutral-600 max-w-xl mx-auto">
            Publica tu espacio, busca cuartos en renta o conecta con roomies compatibles. Todo en un solo lugar.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/explore"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white hover:bg-brandHover transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Buscar roomie
            </Link>
            <Link
              href="/listings"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
            >
              Ver anuncios
            </Link>
            <Link
              href="/listings/new"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Publicar espacio
            </Link>
          </div>

          {/* Stats */}
          {(stats.listings > 0 || stats.profiles > 0) && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
              {stats.listings > 0 && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">{stats.listings.toLocaleString('es-MX')}+</p>
                  <p className="text-xs text-neutral-500 mt-0.5">anuncios activos</p>
                </div>
              )}
              {stats.profiles > 0 && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">{stats.profiles.toLocaleString('es-MX')}+</p>
                  <p className="text-xs text-neutral-500 mt-0.5">roomies registrados</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-2xl font-bold text-neutral-900">5+</p>
                <p className="text-xs text-neutral-500 mt-0.5">ciudades</p>
              </div>
            </div>
          )}

          {/* City pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-neutral-500 mr-1">Buscar en:</span>
            {CITIES.map((city) => (
              <Link
                key={city.value}
                href={`/listings?city=${encodeURIComponent(city.value)}`}
                className="px-3 py-1.5 rounded-full border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
              >
                {city.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Featured Listings */}
        <section className="py-14 md:py-16">
          <HomeFeaturedListings />
        </section>

        {/* Featured Profiles */}
        <section className="pb-14 md:pb-16 border-t border-neutral-100 pt-14">
          <HomeFeaturedProfiles />
        </section>

        {/* How It Works */}
        <section className="py-14 md:py-16 border-t border-neutral-100">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 mb-3">
              Cómo funciona MyRoomie
            </h2>
            <p className="text-base text-neutral-600">
              Encuentra o publica en minutos, sin complicaciones.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand/10 text-brand mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-xs font-semibold text-brand uppercase tracking-wide mb-2">Paso 1</div>
              <h3 className="text-base font-semibold text-neutral-900 mb-2">Crea tu perfil</h3>
              <p className="text-sm text-neutral-600">Cuéntanos tus preferencias, estilo de vida y presupuesto. En 3 minutos.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand/10 text-brand mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="text-xs font-semibold text-brand uppercase tracking-wide mb-2">Paso 2</div>
              <h3 className="text-base font-semibold text-neutral-900 mb-2">Encuentra compatibles</h3>
              <p className="text-sm text-neutral-600">Filtra por ciudad, precio y estilo de vida para encontrar el match ideal.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand/10 text-brand mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="text-xs font-semibold text-brand uppercase tracking-wide mb-2">Paso 3</div>
              <h3 className="text-base font-semibold text-neutral-900 mb-2">Conecta por chat</h3>
              <p className="text-sm text-neutral-600">Habla directamente, coordina una visita y decide con tranquilidad.</p>
            </div>
          </div>
        </section>

        {/* Features / Trust */}
        <section className="py-14 md:py-16 border-t border-neutral-100 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                title: '100% Gratis',
                desc: 'Sin comisiones ni intermediarios. Conecta directo.',
              },
              {
                icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
                title: 'Búsqueda por mapa',
                desc: 'Filtra por zona y encuentra opciones cerca de ti.',
              },
              {
                icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
                title: 'Filtros avanzados',
                desc: 'Por precio, amenidades, estilo de vida y más.',
              },
              {
                icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
                title: 'Seguro y transparente',
                desc: 'Guías de seguridad y mejores prácticas para meetups.',
              },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3 p-5 rounded-2xl bg-neutral-50 border border-neutral-100">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    {f.icon.split(' ').length > 1 ? (
                      f.icon.split(' M').map((d, i) => (
                        <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={i === 0 ? d : `M${d}`} />
                      ))
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                    )}
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-1">{f.title}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
