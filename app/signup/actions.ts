'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getClientIpFromHeaders, checkActionRateLimit } from '@/app/lib/rateLimit'
import { verifyTurnstileToken } from '@/app/lib/turnstile'

/**
 * Rate-limited signup with Turnstile CAPTCHA via server action.
 * Limits: 5 attempts per 60 seconds per IP.
 */
export async function signUpAction(email: string, password: string, turnstileToken: string | null = null) {
  // Verify CAPTCHA first
  const captchaValid = await verifyTurnstileToken(turnstileToken)
  if (!captchaValid) {
    return {
      data: null,
      error: { message: 'Verificación CAPTCHA fallida. Intenta de nuevo.' },
    }
  }

  const ip = getClientIpFromHeaders()
  const allowed = await checkActionRateLimit(ip, 'signup', 5, '60 s')

  if (!allowed) {
    return {
      data: null,
      error: { message: 'Demasiados intentos. Espera un minuto e intenta de nuevo.' },
    }
  }

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { data: null, error: { message: error.message } }
  }

  return { data: { user: data.user }, error: null }
}
