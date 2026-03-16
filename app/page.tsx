import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import HomeFeaturedProfiles from './components/home/HomeFeaturedProfiles'
import HomeFeaturedListings from './components/home/HomeFeaturedListings'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'MyRoomie.mx — Encuentra tu roomie ideal',
  description:
    'La plataforma para encontrar roommates y habitaciones en renta en México. Sin intermediarios, 100% gratis.',
}

async function getStats() {
  try {
    const supabase = createServerSupabaseClient()
    const [listingsRes, profilesRes] = await Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('is_active', true),
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

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Crea tu perfil',
    description: 'Cuéntanos tus preferencias, estilo de vida y presupuesto. En 3 minutos.',
  },
  {
    step: '2',
    title: 'Encuentra compatibles',
    description: 'Filtra por ciudad, precio y estilo de vida para encontrar el match ideal.',
  },
  {
    step: '3',
    title: 'Conecta por chat',
    description: 'Habla directamente, coordina una visita y decide con tranquilidad.',
  },
]

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: '100% Gratis',
    description: 'Sin comisiones ni intermediarios. Conecta directo.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Búsqueda por zona',
    description: 'Filtra por colonia y encuentra opciones cerca de ti.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
      </svg>
    ),
    title: 'Filtros avanzados',
    description: 'Por precio, amenidades, estilo de vida y más.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Seguro y transparente',
    description: 'Guías de seguridad y mejores prácticas para meetups.',
  },
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
              Publicar espacio
            </Link>
          </div>

          {/* Stats */}
          {(stats.listings > 0 || stats.profiles > 0) && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
              {stats.listings > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-neutral-900">{stats.listings}+</div>
                  <div className="text-xs text-neutral-500 mt-0.5">anuncios activos</div>
                </div>
              )}
              {stats.profiles > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-neutral-900">{stats.profiles}+</div>
                  <div className="text-xs text-neutral-500 mt-0.5">roomies registrados</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-2xl font-bold text-neutral-900">5+</div>
                <div className="text-xs text-neutral-500 mt-0.5">ciudades</div>
              </div>
            </div>
          )}

          {/* City quick-search pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-neutral-400 mr-1">Buscar en:</span>
            {CITIES.map((city) => (
              <Link
                key={city.value}
                href={`/listings?city=${encodeURIComponent(city.value)}`}
                className="px-3 py-1 rounded-full border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
              >
                {city.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured content */}
      <div className="mx-auto max-w-7xl px-0 md:px-8">
        <Suspense fallback={null}>
          <HomeFeaturedListings />
        </Suspense>
        <Suspense fallback={null}>
          <HomeFeaturedProfiles />
        </Suspense>
      </div>

      {/* How it works */}
      <section className="mt-20 border-t border-neutral-100 bg-neutral-50/60">
        <div className="mx-auto max-w-5xl px-4 md:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Cómo funciona MyRoomie
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Encuentra o publica en minutos, sin complicaciones.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-brand/10 text-brand text-sm font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-base font-semibold text-neutral-900 mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="border-t border-neutral-100">
        <div className="mx-auto max-w-5xl px-4 md:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">{f.title}</h3>
                  <p className="mt-1 text-sm text-neutral-500 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
