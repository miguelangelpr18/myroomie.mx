import { requireProfileOrRedirect } from '@/lib/requireProfile'
import ListingForm from './ListingForm'

export default async function NewListingPage() {
  // Verificar que el usuario tenga perfil
  await requireProfileOrRedirect()

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Publicar anuncio</h1>
      <p className="text-gray-600 mb-8">
        Publica tu anuncio para encontrar roomie o departamento.
      </p>

      <ListingForm />
    </div>
  )
}

