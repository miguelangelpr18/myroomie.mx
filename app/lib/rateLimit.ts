import { NextRequest } from 'next/server'
import { headers } from 'next/headers'

// ─── Upstash Redis rate limiter ───────────────────────────────────────────────
// Uses @upstash/ratelimit when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// are configured. Falls back to a no-op (allows all) when they are not, so the
// app works in local dev without Redis.

type Limiter = { limit: (id: string) => Promise<{ success: boolean }> }

const _limiters = new Map<string, Limiter>()

async function getLimiter(prefix: string, maxRequests: number, window: string): Promise<Limiter> {
  const key = `${prefix}:${maxRequests}:${window}`
  if (_limiters.has(key)) return _limiters.get(key)!

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(`⚠️ Rate limiting disabled: UPSTASH_REDIS_REST_URL/TOKEN not set. Blocking requests in production.`)
      const blocked: Limiter = { limit: async () => ({ success: false }) }
      _limiters.set(key, blocked)
      return blocked
    }
    // Dev/test: allow all when Redis not configured
    const passthrough: Limiter = { limit: async () => ({ success: true }) }
    _limiters.set(key, passthrough)
    return passthrough
  }

  const { Ratelimit } = await import('@upstash/ratelimit')
  const { Redis } = await import('@upstash/redis')

  const redis = new Redis({ url, token })

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, window as Parameters<typeof Ratelimit.slidingWindow>[1]),
    analytics: false,
    prefix: `myroomie:${prefix}`,
  })

  _limiters.set(key, limiter)
  return limiter
}

/**
 * Extracts the client IP from Vercel/proxy headers (API routes).
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
 * Extracts client IP from headers() in server actions.
 */
export function getClientIpFromHeaders(): string {
  const h = headers()
  const forwarded = h.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const realIp = h.get('x-real-ip')
  if (realIp) return realIp
  return 'unknown'
}

/**
 * Rate-limits by IP for geo API routes (40 req / 60s).
 */
export async function checkGeoRateLimit(ip: string): Promise<boolean> {
  const limiter = await getLimiter('geo', 40, '60 s')
  const { success } = await limiter.limit(ip)
  return success
}

/**
 * Rate-limits for server actions (configurable).
 * Returns true if request is allowed.
 */
export async function checkActionRateLimit(
  userId: string,
  action: string,
  maxRequests = 10,
  window = '60 s'
): Promise<boolean> {
  const limiter = await getLimiter(`action:${action}`, maxRequests, window)
  const { success } = await limiter.limit(userId)
  return success
}
