import { NextRequest } from 'next/server'

// ─── Upstash Redis rate limiter ───────────────────────────────────────────────
// Uses @upstash/ratelimit when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// are configured. Falls back to a no-op (allows all) when they are not, so the
// app works in local dev without Redis.
//
// To enable in production:
//   1. Create a free Redis database at https://console.upstash.com/
//   2. Add to .env.local (and Vercel environment variables):
//        UPSTASH_REDIS_REST_URL=https://...
//        UPSTASH_REDIS_REST_TOKEN=...
//   3. The rate limiter will activate automatically.

let _ratelimiter: { limit: (id: string) => Promise<{ success: boolean }> } | null = null

async function getRateLimiter() {
  if (_ratelimiter) return _ratelimiter

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    // No Redis configured — return a pass-through limiter (local dev / pre-setup)
    _ratelimiter = {
      limit: async () => ({ success: true }),
    }
    return _ratelimiter
  }

  const { Ratelimit } = await import('@upstash/ratelimit')
  const { Redis } = await import('@upstash/redis')

  const redis = new Redis({ url, token })

  _ratelimiter = new Ratelimit({
    redis,
    // 40 requests per 60 seconds per IP, using a sliding window
    limiter: Ratelimit.slidingWindow(40, '60 s'),
    analytics: false,
    prefix: 'myroomie:geo',
  })

  return _ratelimiter
}

/**
 * Extracts the client IP from Vercel/proxy headers.
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
 * Rate-limits by IP using a distributed sliding window (Upstash Redis).
 * Returns true if the request is allowed, false if it should be blocked.
 * Falls back to allowing all requests when Redis is not configured.
 */
export async function checkGeoRateLimit(ip: string): Promise<boolean> {
  const limiter = await getRateLimiter()
  const { success } = await limiter.limit(ip)
  return success
}
