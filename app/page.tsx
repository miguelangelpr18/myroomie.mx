import Link from 'next/link'
import HomeFeaturedProfiles from './components/home/HomeFeaturedProfiles'
import HomeFeaturedListings from './components/home/HomeFeaturedListings'
import HomeSearchBar from './components/home/HomeSearchBar'

export default function Home() {
  return (
    <div className="bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 md:px-8 py-16">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-50 px-6 py-10 md:px-12 md:py-14">
          <div className="pointer-events-none absolute -top-24 right-[-120px] h-72 w-72 rounded-full bg-brandSoft blur-2xl" />
          <div className="relative max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-neutral-900">
              Encuentra roomie o depa con confianza
            </h1>
            <p className="mt-4 text-base md:text-lg text-neutral-600">
              Conecta con roomies compatibles o publica tu anuncio de renta. 
              Todo en un solo lugar.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/explore"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-medium text-white hover:bg-brandHover transition-colors"
              >
                Buscar roomies
              </Link>
              <Link
                href="/listings"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors"
              >
                Ver anuncios
              </Link>
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm font-medium text-neutral-700">
              <Link
                href="/onboarding/step-1"
                className="hover:text-neutral-900"
              >
                Crear mi perfil
              </Link>
              <Link
                href="/listings/new"
                className="hover:text-neutral-900"
              >
                Publicar anuncio
              </Link>
            </div>
            <HomeSearchBar />
          </div>
        </section>

        {/* Featured Profiles */}
        <HomeFeaturedProfiles />

        {/* Featured Listings */}
        <HomeFeaturedListings />

        {/* Trust Section */}
        <section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="text-xl">✓</div>
              <div>
                <h2 className="text-sm font-medium text-neutral-900">Verificación</h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Perfiles verificados para mayor seguridad y confianza en cada conexión.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-xl">⭐</div>
              <div>
                <h2 className="text-sm font-medium text-neutral-900">Reviews</h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Evaluaciones de usuarios reales para ayudarte a tomar decisiones informadas.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-xl">🔒</div>
              <div>
                <h2 className="text-sm font-medium text-neutral-900">Seguridad</h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Protección de datos y transacciones seguras en toda la plataforma.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

