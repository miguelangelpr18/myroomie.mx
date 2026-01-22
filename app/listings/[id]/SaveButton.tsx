import Link from 'next/link'
import { toggleSave } from './actions'

interface SaveButtonProps {
  listingId: string
  isSaved: boolean
  hasSession: boolean
}

export default function SaveButton({ listingId, isSaved, hasSession }: SaveButtonProps) {
  // Si no hay sesión, redirigir a login
  if (!hasSession) {
    return (
      <Link
        href="/login?intent=roomies"
        className="block w-full text-center border border-neutral-200 bg-white text-neutral-700 px-6 py-3 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
      >
        Guardar
      </Link>
    )
  }

  // Si hay sesión, mostrar form con server action
  return (
    <form action={toggleSave.bind(null, listingId)}>
      <button
        type="submit"
        className="w-full border border-neutral-200 bg-white text-neutral-700 px-6 py-3 rounded-lg hover:bg-neutral-50 transition-colors font-medium flex items-center justify-center gap-2"
      >
        {isSaved ? (
          <>
            <span>♥</span>
            <span>Guardado</span>
          </>
        ) : (
          <>
            <span>♡</span>
            <span>Guardar</span>
          </>
        )}
      </button>
    </form>
  )
}


