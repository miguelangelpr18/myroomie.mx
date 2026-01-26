import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerSupabaseClient } from './supabase/server'

interface RequireAuthOptions {
  intent?: 'listings' | 'roomies'
}

export async function requireAuthOrRedirect(options?: RequireAuthOptions) {
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
    if (isValidProtectedRoute) {
      params.set('next', currentPath)
    }
    
    const queryString = params.toString()
    const loginUrl = queryString ? `/login?${queryString}` : '/login'
    
    redirect(loginUrl)
  }

  // Si existe sesión => return { user: session.user }
  return { user: session.user }
}

