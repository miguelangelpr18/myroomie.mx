import Link from 'next/link'

interface TrustPanelProps {
  isOwner?: boolean
}

export default function TrustPanel({ isOwner = false }: TrustPanelProps) {
  return (
    <div className="space-y-6">
      {/* Rating placeholder */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className="w-5 h-5 text-gray-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-sm text-gray-600">Sin reseñas aún</span>
      </div>

      {/* Verifications section */}
      <div>
        <div className="mb-3">
          <h3 className="text-lg font-semibold mb-1">Verificaciones</h3>
          <p className="text-sm text-gray-600">
            Próximamente podrás verificar tu identidad para generar confianza
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Teléfono verificado */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-60">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">Teléfono</span>
            </div>
            <p className="text-xs text-gray-500">Coming soon</p>
          </div>

          {/* ID verificado */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-60">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">ID</span>
            </div>
            <p className="text-xs text-gray-500">Coming soon</p>
          </div>

          {/* Redes sociales */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-60">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">Redes sociales</span>
            </div>
            <p className="text-xs text-gray-500">Coming soon</p>
          </div>

          {/* Background/Credit check */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-60">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">Background check</span>
            </div>
            <p className="text-xs text-gray-500">Coming soon</p>
          </div>
        </div>

        {/* CTA para owner */}
        {isOwner && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 text-sm text-[#FF7A18] hover:text-[#E86F14] hover:underline"
            >
              <span>Completar verificaciones (próximamente)</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}



