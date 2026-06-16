import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Upstash sliding-window limiter when env vars are present.
// Falls back to in-process Map in development / when Redis is not configured.

let upstash: Ratelimit | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  upstash = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 h'),
    prefix: 'movy:rl',
  })
}

// In-process fallback (single-instance only — used when Upstash is not configured)
const store = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60 * 60 * 1000

export async function rateLimitIp(ip: string, max = 60): Promise<boolean> {
  if (upstash) {
    const { success } = await upstash.limit(ip)
    return success
  }

  const now = Date.now()
  const entry = store.get(ip)
  if (!entry || now >= entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= max) return false
  entry.count++
  return true
}

export function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
}
