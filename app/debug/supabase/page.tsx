import { notFound } from 'next/navigation'
import SupabaseDebugClient from './SupabaseDebugClient'

export default function SupabaseDebug() {
  // En producción, bloquear acceso
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  // En desarrollo, renderizar componente client
  return <SupabaseDebugClient />
}
