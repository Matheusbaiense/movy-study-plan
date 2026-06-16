'use client'

import { useState, useEffect, useTransition } from 'react'
import { Clock, Square } from 'lucide-react'
import type { TimeEntry } from '@/lib/hr/types'
import { clockInAction, clockOutAction } from '@/app/[locale]/(protected)/hr/actions'

interface ClockWidgetProps {
  activeEntry: TimeEntry | null
  locale: string
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function ClockWidget({ activeEntry, locale }: ClockWidgetProps) {
  const [elapsed, setElapsed] = useState(0)
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isClockedIn = activeEntry !== null

  useEffect(() => {
    if (!isClockedIn || !activeEntry?.clock_in) return
    const start = new Date(activeEntry.clock_in).getTime()
    const tick = () => setElapsed(Date.now() - start)
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isClockedIn, activeEntry?.clock_in])

  function handleClockIn() {
    setError(null)
    startTransition(async () => {
      try {
        await clockInAction(description || undefined)
        setDescription('')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error')
      }
    })
  }

  function handleClockOut() {
    if (!activeEntry) return
    setError(null)
    startTransition(async () => {
      try {
        await clockOutAction(activeEntry.id)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error')
      }
    })
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #4B1A77 0%, #2A1153 100%)',
      borderRadius: 16,
      padding: 24,
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {isClockedIn && (
        <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#4ade80',
            animation: 'clock-widget-pulse 1.5s infinite',
          }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', opacity: 0.85 }}>LIVE</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Clock size={20} style={{ opacity: 0.8 }} />
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', opacity: 0.85 }}>
          {locale === 'pt' ? 'Controle de Ponto' : 'Time Clock'}
        </span>
      </div>

      {isClockedIn ? (
        <>
          <div style={{
            fontSize: 40, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
            color: '#FBB615', letterSpacing: '-0.02em', marginBottom: 8,
          }}>
            {formatElapsed(elapsed)}
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 20 }}>
            {locale === 'pt' ? 'tempo decorrido' : 'elapsed time'}
          </div>
          {activeEntry?.description && (
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 16, fontStyle: 'italic' }}>
              {activeEntry.description}
            </div>
          )}
          <button
            onClick={handleClockOut}
            disabled={isPending}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 8, padding: '10px 20px', color: '#fff',
              fontSize: 14, fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer',
              width: '100%', justifyContent: 'center',
            }}
          >
            <Square size={16} />
            {isPending ? '...' : (locale === 'pt' ? 'Bater Ponto Saída' : 'Clock Out')}
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 14, opacity: 0.75, marginBottom: 16 }}>
            {locale === 'pt' ? 'Nenhum registro ativo' : 'No active session'}
          </div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={locale === 'pt' ? 'Descrição (opcional)' : 'Description (optional)'}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8,
              padding: '8px 12px', color: '#fff', fontSize: 13,
              marginBottom: 12, boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleClockIn}
            disabled={isPending}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#FBB615', border: 'none', borderRadius: 8,
              padding: '10px 20px', color: '#000',
              fontSize: 14, fontWeight: 700, cursor: isPending ? 'not-allowed' : 'pointer',
              width: '100%', justifyContent: 'center',
            }}
          >
            <Clock size={16} />
            {isPending ? '...' : (locale === 'pt' ? 'Bater Ponto Entrada' : 'Clock In')}
          </button>
        </>
      )}

      {error && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#fca5a5' }}>{error}</div>
      )}

      <style>{`
        @keyframes clock-widget-pulse {
          0% { box-shadow: 0 0 0 0 rgba(74,222,128,0.6); }
          70% { box-shadow: 0 0 0 8px rgba(74,222,128,0); }
          100% { box-shadow: 0 0 0 0 rgba(74,222,128,0); }
        }
      `}</style>
    </div>
  )
}
