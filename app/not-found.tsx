import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-neutral-200 mb-4">404</div>
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
          Página no encontrada
        </h1>
        <p className="text-neutral-500 text-sm mb-6">
          La página que buscas no existe o fue movida. Puedes explorar roomies o ver anuncios disponibles.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/explore"
            className="inline-flex h-10 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brandHover transition-colors"
          >
            Explorar roomies
          </Link>
          <Link
            href="/listings"
            className="inline-flex h-10 items-center rounded-xl border border-neutral-200 px-5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Ver anuncios
          </Link>
        </div>
      </div>
    </div>
  )
}
