import { createBrowserSupabaseClient } from './supabase/client'

export interface AuthError {
  message: string
}

export async function signUp(email: string, password: string) {
  const supabase = createBrowserSupabaseClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { data: null, error: { message: error.message } }
  }

  return { data, error: null }
}

export async function signIn(email: string, password: string) {
  const supabase = createBrowserSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { data: null, error: { message: error.message } }
  }

  return { data, error: null }
}

export async function signOut() {
  const supabase = createBrowserSupabaseClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: { message: error.message } }
  }

  return { error: null }
}

