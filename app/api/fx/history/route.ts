import { NextResponse } from 'next/server'

// Historical AUD→BRL series for the câmbio chart (mid-market).
// Wise /v1/rates with from/to/group=day (token) → frankfurter (ECB) fallback.
// Public via the same middleware bypass as /api/fx. Cached 1h per range.

export const dynamic = 'force-dynamic'

interface Point {
  date: string
  rate: number
}

const ALLOWED = [30, 90, 365]

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

async function wiseHistory(token: string, days: number): Promise<{ points: Point[]; source: string } | null> {
  try {
    const to = new Date()
    const from = new Date(to.getTime() - days * 24 * 3600 * 1000)
    const url = `https://api.wise.com/v1/rates?source=AUD&target=BRL&from=${isoDate(from)}&to=${isoDate(to)}&group=day`
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 3600 } })
    if (!r.ok) return null
    const j = await r.json()
    if (!Array.isArray(j)) return null
    const points = j
      .map((row: any) => ({ date: typeof row?.time === 'string' ? row.time.slice(0, 10) : '', rate: row?.rate }))
      .filter((p: Point) => p.date && typeof p.rate === 'number' && Number.isFinite(p.rate))
      .sort((a: Point, b: Point) => a.date.localeCompare(b.date))
    return points.length >= 2 ? { points, source: 'Wise' } : null
  } catch {
    return null
  }
}

async function frankfurterHistory(days: number): Promise<{ points: Point[]; source: string } | null> {
  try {
    const to = new Date()
    const from = new Date(to.getTime() - days * 24 * 3600 * 1000)
    const url = `https://api.frankfurter.app/${isoDate(from)}..${isoDate(to)}?from=AUD&to=BRL`
    const r = await fetch(url, { next: { revalidate: 3600 } })
    if (!r.ok) return null
    const j = await r.json()
    const rates = j?.rates
    if (!rates) return null
    const points: Point[] = Object.keys(rates)
      .sort()
      .map((d) => ({ date: d, rate: rates[d]?.BRL }))
      .filter((p) => typeof p.rate === 'number' && Number.isFinite(p.rate))
    return points.length >= 2 ? { points, source: 'ECB (frankfurter)' } : null
  } catch {
    return null
  }
}

const cache = new Map<number, { data: unknown; ts: number }>()
const TTL_MS = 60 * 60 * 1000

export async function GET(req: Request) {
  const url = new URL(req.url)
  let days = Number.parseInt(url.searchParams.get('days') ?? '90', 10)
  if (!ALLOWED.includes(days)) days = 90

  const hit = cache.get(days)
  if (hit && Date.now() - hit.ts < TTL_MS) return NextResponse.json(hit.data)

  const token = process.env.WISE_API_TOKEN
  const data =
    (token ? await wiseHistory(token, days) : null) ??
    (await frankfurterHistory(days)) ??
    { points: [] as Point[], source: 'indisponível' }

  if ((data.points as Point[]).length > 0) cache.set(days, { data, ts: Date.now() })
  return NextResponse.json(data)
}
