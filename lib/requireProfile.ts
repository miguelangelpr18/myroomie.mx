import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerSupabaseClient } from './supabase/server'

export async function requireProfileOrRedirect() {
  const supabase = createServerSupabaseClient()

  // Obtener sesión
  const { data: { session }, error } = await supabase.auth.getSession()

  // Si no hay session.user => redirect a login con next param
  if (!session?.user || error) {
    // Intentar obtener la ruta actual desde el referer header
    const headersList = headers()
    const referer = headersList.get('referer')
    let currentPath: string | null = null
    
    if (referer) {
      try {
        const refererUrl = new URL(referer)
        currentPath = refererUrl.pathname
      } catch {
        // Si no se puede parsear, ignorar
      }
    }
    
    // Construir URL de login con next param si existe ruta actual válida
    // Solo incluir next si la ruta no es login/signup y es una ruta protegida
    const isValidProtectedRoute = currentPath && 
      currentPath !== '/login' && 
      currentPath !== '/signup' &&
      currentPath !== '/' &&
      !currentPath.startsWith('/legal')
    
    const loginUrl = isValidProtectedRoute
      ? `/login?intent=roomies&next=${encodeURIComponent(currentPath)}`
      : '/login?intent=roomies'
    
    redirect(loginUrl)
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

