import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from './supabase/server'

export async function requireProfileOrRedirect() {
  const supabase = createServerSupabaseClient()

  // Obtener sesión
  const { data: { session }, error } = await supabase.auth.getSession()

  // Si no hay session.user => redirect("/login?intent=roomies")
  if (!session?.user || error) {
    redirect('/login?intent=roomies')
  }

  // Consultar tabla profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', session.user.id)
    .limit(1)
    .maybeSingle()

  // Si no existe => redirect("/onboarding/step-1")
  if (!profile || profileError) {
    redirect('/onboarding/step-1')
  }

  // Si existe => return { user: session.user }
  return { user: session.user }
}

