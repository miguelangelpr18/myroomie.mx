import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuthOrRedirect } from '@/lib/requireAuth'
import Link from 'next/link'
import PromoteButton from './PromoteButton'
import { notFound } from 'next/navigation'

export default async function PromoteListingPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAuthOrRedirect({ intent: 'listings' })

  const supabase = createServerSupabaseClient()

  // Obtener sesión
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return null
  }

  // Cargar listing por id
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, title, user_id')
    .eq('id', params.id)
    .single()

  // Si no existe o hay error, mostrar not found
  if (!listing || listingError) {
    notFound()
  }

  // Si no es del usuario, mostrar error humano
  if (listing.user_id !== session.user.id) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No autorizado
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Solo puedes promocionar tus propios anuncios.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-[#FF7A18] text-white px-6 py-2 rounded-lg hover:bg-[#E86F14] text-sm font-medium"
          >
            Volver al dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">Promociona tu anuncio</h1>
        <p className="text-gray-600 text-lg mb-2">
          Aparece primero en Anuncios y recibe más contactos.
        </p>
        <p className="text-sm text-gray-500">
          Anuncio: <strong>{listing.title}</strong>
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Plan 1: 3 días */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">3 días</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">$99</span>
              <span className="text-gray-600 ml-1">MXN</span>
            </div>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-[#FF7A18] mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-700">Apareces en la parte superior</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-[#FF7A18] mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-700">Badge destacado</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-[#FF7A18] mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-700">Más vistas y contactos</span>
            </li>
          </ul>
          <PromoteButton listingId={listing.id} planName="3 días" planDays={3} />
        </div>

        {/* Plan 2: 7 días */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">7 días</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">$199</span>
              <span className="text-gray-600 ml-1">MXN</span>
            </div>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-[#FF7A18] mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-700">Apareces en la parte superior</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-[#FF7A18] mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-700">Badge destacado</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-[#FF7A18] mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-700">Más vistas y contactos</span>
            </li>
          </ul>
          <PromoteButton listingId={listing.id} planName="7 días" planDays={7} />
        </div>

        {/* Plan 3: 30 días - Mejor valor */}
        <div className="bg-white p-6 rounded-lg shadow border-2 border-[#FF7A18] relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-[#FF7A18] text-white px-4 py-1 rounded-full text-xs font-semibold">
              Mejor valor
            </span>
          </div>
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">30 días</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">$499</span>
              <span className="text-gray-600 ml-1">MXN</span>
            </div>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-[#FF7A18] mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-700">Apareces en la parte superior</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-[#FF7A18] mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-700">Badge destacado</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-[#FF7A18] mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-700">Más vistas y contactos</span>
            </li>
          </ul>
          <PromoteButton listingId={listing.id} planName="30 días" planDays={30} />
        </div>
      </div>

      {/* CTA secundario */}
      <div className="text-center space-y-2">
        <Link
          href={`/listings/${listing.id}`}
          className="text-[#FF7A18] hover:text-[#E86F14] hover:underline text-sm font-medium"
        >
          Ver anuncio
        </Link>
        <span className="text-gray-400 mx-2">•</span>
        <Link
          href="/dashboard"
          className="text-[#FF7A18] hover:text-[#E86F14] hover:underline text-sm font-medium"
        >
          Quedarme gratis
        </Link>
      </div>
    </div>
  )
}

