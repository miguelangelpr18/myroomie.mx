import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerSupabaseClient } from './supabase/server'

interface RequireAuthOptions {
  intent?: 'listings' | 'roomies'
}

export async function requireAuthOrRedirect(options?: RequireAuthOptions) {
  const supabase = createServerSupabaseClient()

  // getUser() re-validates the JWT with the Supabase Auth server — safe for access control.
  // getSession() reads only from the cookie and must not be used for auth decisions.
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
    const isValidProtectedRoute = currentPath && 
      currentPath !== '/login' && 
      currentPath !== '/signup' &&
      currentPath !== '/' &&
      !currentPath.startsWith('/legal')
    
    // Construir query params
    const params = new URLSearchParams()
    if (options?.intent) {
      params.set('intent', options.intent)
    }
    if (isValidProtectedRoute && currentPath) {
      params.set('next', currentPath)
    }
    
    const queryString = params.toString()
    const loginUrl = queryString ? `/login?${queryString}` : '/login'
    
    redirect(loginUrl)
  }

  return { user }
}

