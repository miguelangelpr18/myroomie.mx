import { requireAuthOrRedirect } from '@/lib/requireAuth'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Compatibles' }

export default async function MatchesPage() {
  await requireAuthOrRedirect()
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">Encuentra tu match perfecto</h1>
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-neutral-200">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand/10 text-brand mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-3">
            Próximamente: Compatibilidad inteligente
          </h2>
          <p className="text-neutral-600 mb-6">
            Estamos desarrollando un sistema de matching automático que te conectará con los roomies más compatibles según tus preferencias de estilo de vida, presupuesto y ubicación.
          </p>
          <div className="bg-neutral-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-neutral-900 mb-3">Esta función incluirá:</h3>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Algoritmo de compatibilidad basado en estilo de vida y preferencias</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Puntuación de compatibilidad personalizada</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Recomendaciones diarias de roomies compatibles</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Filtros inteligentes por ubicación y presupuesto</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-brand text-white hover:bg-brandHover transition-colors font-medium"
            >
              Ver roomies disponibles
            </Link>
            <Link
              href="/listings"
              className="inline-flex items-center justify-center h-11 px-6 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors font-medium"
            >
              Ver anuncios
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
