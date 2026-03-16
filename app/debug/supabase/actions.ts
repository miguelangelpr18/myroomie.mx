'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function testSupabaseConnection() {
  try {
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

    try {
      const supabase = createServerSupabaseClient()
      const { error } = await supabase.auth.getUser()

      if (error) {
        return {
          error: error.message || 'Error al conectar con Supabase',
          message: '',
          urlPreview,
          hasKey,
        }
      }

      return {
        error: null,
        message: 'Conexión exitosa',
        urlPreview,
        hasKey,
      }
    } catch (clientError) {
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
