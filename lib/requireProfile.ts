import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerSupabaseClient } from './supabase/server'

export async function requireProfileOrRedirect() {
  const supabase = createServerSupabaseClient()

  // getUser() re-validates the JWT with the Supabase Auth server — safe for access control.
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) {
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
    
    const loginUrl =
      isValidProtectedRoute && currentPath
        ? `/login?intent=roomies&next=${encodeURIComponent(currentPath)}`
        : '/login?intent=roomies'
    
    redirect(loginUrl)
  }

  // Consultar tabla profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!profile || profileError) {
    redirect('/onboarding/step-1')
  }

  return { user }
}

