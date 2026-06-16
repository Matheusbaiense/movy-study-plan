// Per-IP in-memory rate limiter. Not shared across Vercel instances —
// replace store with Upstash Redis for true multi-instance limiting.

const store = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60 * 60 * 1000

export function rateLimitIp(ip: string, max = 60): boolean {
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
