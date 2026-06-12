import { NextResponse } from 'next/server'

// Live AUD→BRL exchange rate for the financial-capacity budget.
// Source: open.er-api.com (free, no key, daily, returns a timestamp) with
// frankfurter.app (ECB) as fallback. Cached ~1h so we don't hammer the APIs.
export const revalidate = 3600

interface FxResult {
  rate: number
  asOf: string
}

async function fromErApi(): Promise<FxResult | null> {
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/AUD', { next: { revalidate: 3600 } })
    if (!r.ok) return null
    const j = await r.json()
    const rate = j?.rates?.BRL
    if (typeof rate !== 'number' || !Number.isFinite(rate)) return null
    const asOf = j?.time_last_update_utc ? new Date(j.time_last_update_utc).toISOString() : new Date().toISOString()
    return { rate, asOf }
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
    return { rate, asOf }
  } catch {
    return null
  }
}

export async function GET() {
  let data = await fromErApi()
  let source = 'open.er-api.com'
  if (!data) {
    data = await fromFrankfurter()
    source = 'frankfurter.app'
  }

  if (!data) {
    return NextResponse.json({ rate: null, asOf: null, source: null }, { status: 200 })
  }

  return NextResponse.json(
    { rate: Math.round(data.rate * 10000) / 10000, asOf: data.asOf, source },
    { status: 200 },
  )
}
