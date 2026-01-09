import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars: string[] = []
  if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  if (process.env.NODE_ENV === 'development') {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please create a .env.local file with these variables.'
    )
  }
  // En producción, crear un cliente vacío para evitar errores
  throw new Error(`Missing Supabase configuration: ${missingVars.join(', ')}`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

