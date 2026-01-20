import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from './supabase/server'

interface RequireAuthOptions {
  intent?: 'listings' | 'roomies'
}

export async function requireAuthOrRedirect(options?: RequireAuthOptions) {
  const supabase = createServerSupabaseClient()

  // Obtener sesión
  const { data: { session }, error } = await supabase.auth.getSession()

  // Si no hay session.user => redirect("/login")
  if (!session?.user || error) {
    if (options?.intent) {
      redirect(`/login?intent=${options.intent}`)
    } else {
      redirect('/login')
    }
  }

  // Si existe sesión => return { user: session.user }
  return { user: session.user }
}

