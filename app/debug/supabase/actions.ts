'use server'

export async function testSupabaseConnection() {
  try {
    // Validar que las env vars existen (sin mostrar keys completas)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const urlPreview = url ? `${url.substring(0, 30)}...` : 'NO CONFIGURADO'

    if (!url || !hasKey) {
      return {
        error: `Variables de entorno faltantes: ${!url ? 'NEXT_PUBLIC_SUPABASE_URL' : ''}${!url && !hasKey ? ', ' : ''}${!hasKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : ''}`,
        message: '',
        urlPreview,
        hasKey,
      }
    }

    // Intentar importar y crear el cliente
    try {
      const { supabase } = await import('@/lib/supabaseClient')
      
      // Usar auth.getSession() como método simple de prueba de conexión (no requiere tablas ni RPC)
      const { data, error } = await supabase.auth.getSession()

      // Si hay error, la conexión falló
      if (error) {
        return {
          error: error.message || 'Error al conectar con Supabase',
          message: '',
          urlPreview,
          hasKey,
        }
      }

      // Si no hay error, la conexión funcionó (no importa si hay sesión o no)
      return {
        error: null,
        message: 'Conexión exitosa',
        urlPreview,
        hasKey,
      }
    } catch (clientError) {
      // Error al crear/importar el cliente (env vars inválidas o error en creación)
      return {
        error: clientError instanceof Error ? clientError.message : 'Error al crear cliente de Supabase',
        message: '',
        urlPreview,
        hasKey,
      }
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Error desconocido',
      message: '',
      urlPreview: 'NO CONFIGURADO',
      hasKey: false,
    }
  }
}

