'use server'

import { getClientIpFromHeaders, checkActionRateLimit } from '@/app/lib/rateLimit'
import { verifyTurnstileToken } from '@/app/lib/turnstile'

/**
 * Rate-limit + Turnstile CAPTCHA check for login attempts.
 * Limits: 10 attempts per 60 seconds per IP.
 */
export async function checkLoginRateLimit(turnstileToken: string | null = null): Promise<{
  allowed: boolean
  message?: string
}> {
  // Verify CAPTCHA first
  const captchaValid = await verifyTurnstileToken(turnstileToken)
  if (!captchaValid) {
    return {
      allowed: false,
      message: 'Verificación CAPTCHA fallida. Intenta de nuevo.',
    }
  }

  const ip = getClientIpFromHeaders()
  const allowed = await checkActionRateLimit(ip, 'login', 10, '60 s')

  if (!allowed) {
    return {
      allowed: false,
      message: 'Demasiados intentos. Espera un minuto e intenta de nuevo.',
    }
  }

  return { allowed: true }
}
