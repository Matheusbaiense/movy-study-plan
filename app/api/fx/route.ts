import { NextResponse } from 'next/server'

// Live AUD→BRL exchange rate for the financial-capacity budget.
//
// Priority:
//   1. Wise QUOTE (fee-inclusive) — needs a full WISE_API_TOKEN that can create
//      quotes. Quotes AUD→BRL, derives Wise's effective fee %, and returns the
//      BRL-per-AUD rate WITH that fee applied (what the student actually faces).
//   2. Wise mid-market (/v1/rates) — works with a read-only token, no fee.
//   3. open.er-api.com → 4. frankfurter.app — free, keyless fallbacks.
//
// The token is NEVER hardcoded; it is read from process.env.WISE_API_TOKEN.
// Results are cached in-memory for 1h so we don't create a quote per request.

export const dynamic = 'force-dynamic'

const WISE_BASE = 'https://api.wise.com'
const TTL_MS = 60 * 60 * 1000

interface FxResult {
  rate: number
  asOf: string
  source: string
  mid?: number
  feePct?: number
}

let cache: { data: FxResult; ts: number } | null = null

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })

async function wiseProfileId(token: string): Promise<string | null> {
  if (process.env.WISE_PROFILE_ID) return process.env.WISE_PROFILE_ID
  try {
    const r = await fetch(`${WISE_BASE}/v1/profiles`, { headers: authHeaders(token), cache: 'no-store' })
    if (!r.ok) return null
    const profiles = await r.json()
    if (!Array.isArray(profiles)) return null
    const biz = profiles.find((p: any) => p?.type === 'business') ?? profiles[0]
    return biz?.id != null ? String(biz.id) : null
  } catch {
    return null
  }
}

// Wise quote — effective fee-inclusive BRL-per-AUD rate.
async function fromWiseQuote(token: string): Promise<FxResult | null> {
  try {
    const profileId = await wiseProfileId(token)
    if (!profileId) return null

    const source = 10000
    const r = await fetch(`${WISE_BASE}/v3/profiles/${profileId}/quotes`, {
      method: 'POST',
      headers: authHeaders(token),
      cache: 'no-store',
      body: JSON.stringify({ sourceCurrency: 'AUD', targetCurrency: 'BRL', sourceAmount: source, payOut: 'BALANCE' }),
    })
    if (!r.ok) return null
    const q = await r.json()

    const mid = typeof q?.rate === 'number' && Number.isFinite(q.rate) ? q.rate : null
    if (!mid) return null

    // Best (cheapest) payment option = most BRL received for 10k AUD.
    const opts = Array.isArray(q?.paymentOptions)
      ? q.paymentOptions.filter((o: any) => !o?.disabled && typeof o?.targetAmount === 'number' && o.targetAmount > 0)
      : []
    const bestTarget = opts.reduce((m: number, o: any) => Math.max(m, o.targetAmount), 0)
    if (!bestTarget) return null

    const effectiveSell = bestTarget / source // BRL per AUD when selling AUD (after fee)
    const feePct = Math.max(0, (mid - effectiveSell) / mid)
    // Conservative BRL-per-AUD for FUNDING (buying AUD with BRL): mid + Wise fee.
    const rate = mid * (1 + feePct)
    const asOf = q?.rateTimestamp ?? q?.createdTime ?? new Date().toISOString()

    return {
      rate: Math.round(rate * 10000) / 10000,
      asOf: new Date(asOf).toISOString(),
      source: 'Wise (com taxas)',
      mid: Math.round(mid * 10000) / 10000,
      feePct: Math.round(feePct * 10000) / 100, // percent, 2 dp
    }
  } catch {
    return null
  }
}

// Wise mid-market (/v1/rates) — read-only token, no fee.
async function fromWiseMid(token: string): Promise<FxResult | null> {
  try {
    const r = await fetch(`${WISE_BASE}/v1/rates?source=AUD&target=BRL`, { headers: authHeaders(token), next: { revalidate: 3600 } })
    if (!r.ok) return null
    const j = await r.json()
    const row = Array.isArray(j) ? j[0] : j
    const rate = row?.rate
    if (typeof rate !== 'number' || !Number.isFinite(rate)) return null
    const asOf = row?.time ? new Date(row.time).toISOString() : new Date().toISOString()
    return { rate: Math.round(rate * 10000) / 10000, asOf, source: 'Wise (mid-market)' }
  } catch {
    return null
  }
}

async function fromErApi(): Promise<FxResult | null> {
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/AUD', { next: { revalidate: 3600 } })
    if (!r.ok) return null
    const j = await r.json()
    const rate = j?.rates?.BRL
    if (typeof rate !== 'number' || !Number.isFinite(rate)) return null
    const asOf = j?.time_last_update_utc ? new Date(j.time_last_update_utc).toISOString() : new Date().toISOString()
    return { rate: Math.round(rate * 10000) / 10000, asOf, source: 'open.er-api.com' }
  } catch {
    return null
  }
}

async function fromFrankfurter(): Promise<FxResult | null> {
  try {
    const r = await fetch('https://api.frankfurter.app/latest?from=AUD&to=BRL', { next: { revalidate: 3600 } })
    if (!r.ok) return null
    const j = await r.json()
    const rate = j?.rates?.BRL
    if (typeof rate !== 'number' || !Number.isFinite(rate)) return null
    const asOf = j?.date ? new Date(`${j.date}T00:00:00Z`).toISOString() : new Date().toISOString()
    return { rate: Math.round(rate * 10000) / 10000, asOf, source: 'frankfurter.app' }
  } catch {
    return null
  }
}

async function resolveRate(): Promise<FxResult> {
  const token = process.env.WISE_API_TOKEN
  if (token) {
    const quote = await fromWiseQuote(token)
    if (quote) return quote
    const mid = await fromWiseMid(token)
    if (mid) return mid
  }
  return (await fromErApi()) ?? (await fromFrankfurter()) ?? { rate: 0, asOf: new Date().toISOString(), source: 'indisponível' }
}

export async function GET() {
  if (cache && Date.now() - cache.ts < TTL_MS) {
    return NextResponse.json(cache.data)
  }
  const data = await resolveRate()
  if (data.rate > 0) {
    cache = { data, ts: Date.now() }
    return NextResponse.json(data)
  }
  return NextResponse.json(data, { status: 503 })
}
