import { NextRequest } from 'next/server'

const WINDOW_MS = 60_000 // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 40

/** Entradas: count en ventana y timestamp de fin de ventana */
const store = new Map<string, { count: number; resetAt: number }>()

/**
 * Obtiene la IP del cliente (x-forwarded-for primero, típico detrás de proxy/Vercel).
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  return 'unknown'
}

/**
 * Rate limit por IP en ventana deslizante de 60s.
 * Retorna true si la petición está permitida, false si se excedió el límite.
 */
export function checkGeoRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = store.get(ip)
  if (!entry) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.resetAt <= now) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  entry.count += 1
  if (entry.count > MAX_REQUESTS_PER_WINDOW) return false
  return true
}
