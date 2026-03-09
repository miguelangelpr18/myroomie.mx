import { requireAuthOrRedirect } from '@/lib/requireAuth'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compatibles',
}

export default async function MatchesPage() {
  await requireAuthOrRedirect()

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Compatibles</h1>
      <div className="bg-white p-12 rounded-lg shadow text-center">
        <p className="text-gray-600 text-lg">Próximamente</p>
      </div>
    </div>
  )
}



