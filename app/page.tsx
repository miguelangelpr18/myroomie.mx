import Link from 'next/link'
import HomeFeaturedProfiles from './components/home/HomeFeaturedProfiles'
import HomeFeaturedListings from './components/home/HomeFeaturedListings'

export default function Home() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900">
              Tu roomie ideal y tu próximo hogar, en un solo lugar.
            </h1>
            <p className="mt-4 text-base md:text-lg text-neutral-600 max-w-xl">
              Publica, busca y conecta con roomies reales, con total seguridad.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/explore"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-brand px-4 text-sm font-medium text-white hover:bg-brandHover transition-colors focus:outline-none focus:ring-2 focus:ring-brandBorder"
              >
                Buscar roomie
              </Link>
              <Link
                href="/listings/new"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brandBorder"
              >
                Publicar anuncio
              </Link>
            </div>
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

