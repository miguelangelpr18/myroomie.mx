import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-6">
        <svg
          className="w-8 h-8 text-brand"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-2">
        Página no encontrada
      </h1>
      <p className="text-neutral-500 text-sm max-w-md mb-8">
        La página que buscas no existe o fue movida. Verifica la URL o regresa al inicio.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-10 items-center px-5 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brandHover transition-colors"
        >
          Ir al inicio
        </Link>
        <Link
          href="/listings"
          className="inline-flex h-10 items-center px-5 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          Ver anuncios
        </Link>
      </div>
    </div>
  )
}
