import Link from 'next/link'
import HomeFeaturedProfiles from './components/home/HomeFeaturedProfiles'
import HomeFeaturedListings from './components/home/HomeFeaturedListings'

export default function Home() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Hero */}
        <section className="pt-14 md:pt-20 pb-6 md:pb-8 flex items-center">
          <div className="max-w-4xl xl:max-w-6xl mx-auto text-center w-full">
            <h1 className="text-4xl md:text-5xl xl:text-[52px] xl:whitespace-nowrap font-medium tracking-[-0.01em] leading-[1.1] text-neutral-900 max-w-3xl xl:max-w-none mx-auto text-center">
              Tu roomie ideal y tu próximo hogar, en un solo lugar.
            </h1>
            <p className="mt-4 text-base md:text-lg font-medium text-neutral-700 max-w-2xl mx-auto text-center">
              Publica, busca y conecta con roomies reales, con claridad.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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

        {/* Featured Listings */}
        <HomeFeaturedListings />

        {/* Featured Profiles */}
        <HomeFeaturedProfiles />

        {/* How It Works */}
        <section className="mt-16 md:mt-20">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-3xl md:text-4xl font-medium tracking-[-0.01em] text-neutral-900 mb-3">
                Encontrar roomie nunca fue tan fácil
              </h2>
              <p className="text-base md:text-lg text-neutral-600">
                Publica, conecta y decide con tranquilidad en minutos.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
              {/* Step 1 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand/10 text-brand mb-4">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Publica o busca
                </h3>
                <p className="text-sm text-neutral-600">
                  Crea tu anuncio o explora perfiles de roomies compatibles con tus preferencias.
                </p>
              </div>
              {/* Step 2 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand/10 text-brand mb-4">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Conecta con personas reales
                </h3>
                <p className="text-sm text-neutral-600">
                  Chatea directamente y conoce a tu futuro roomie antes de decidir.
                </p>
              </div>
              {/* Step 3 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand/10 text-brand mb-4">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Decide con tranquilidad
                </h3>
                <p className="text-sm text-neutral-600">
                  Mensajería directa para coordinar y conocerte antes de decidir.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="mt-16 md:mt-20 mb-20 md:mb-28">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-medium text-neutral-900 mb-1">Perfiles completos</h3>
                  <p className="text-sm text-neutral-600">
                    Información clara y preferencias para encontrar mejor match.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-medium text-neutral-900 mb-1">Búsqueda por ubicación</h3>
                  <p className="text-sm text-neutral-600">
                    Filtra por zona y ubicación para ver opciones cerca de ti.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-medium text-neutral-900 mb-1">Buenas prácticas</h3>
                  <p className="text-sm text-neutral-600">
                    Recomendamos videollamada y conocer en persona antes de acordar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

