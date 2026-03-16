import { requireAuthOrRedirect } from '@/lib/requireAuth'
import ListingForm from './ListingForm'

export default async function NewListingPage() {
  // Verificar que el usuario esté logueado (no requiere perfil)
  // Si no hay sesión, redirigir a /login?intent=listings para que vuelva aquí después del login
  await requireAuthOrRedirect({ intent: 'listings' })

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight mb-3">Publicar anuncio</h1>
      <p className="text-neutral-500 text-sm mb-8">
        Publica tu anuncio para encontrar roomie o departamento.
      </p>

      <ListingForm />
    </div>
  )
}

