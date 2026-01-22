import Link from 'next/link'
import { getOrCreateListingThread } from './actions'

interface ContactFormProps {
  listingId: string
  isOwner: boolean
  hasSession: boolean
}

export default function ContactForm({ listingId, isOwner, hasSession }: ContactFormProps) {
  // Si es el owner, mostrar link a dashboard
  if (isOwner) {
    return (
      <Link
        href="/dashboard"
        className="block w-full text-center bg-neutral-100 text-neutral-700 px-6 py-3 rounded-lg hover:bg-neutral-200 transition-colors font-medium"
      >
        Ir a mi dashboard
      </Link>
    )
  }

  // Si no hay sesión, mostrar link a login
  if (!hasSession) {
    return (
      <Link
        href="/login?intent=roomies"
        className="block w-full text-center bg-brand text-white px-6 py-3 rounded-lg hover:bg-brandHover transition-colors font-medium"
      >
        Contactar
      </Link>
    )
  }

  // Si hay sesión y no es owner, mostrar form con server action
  return (
    <form action={getOrCreateListingThread.bind(null, listingId)}>
      <button
        type="submit"
        className="w-full bg-brand text-white px-6 py-3 rounded-lg hover:bg-brandHover transition-colors font-medium"
      >
        Contactar
      </button>
    </form>
  )
}


