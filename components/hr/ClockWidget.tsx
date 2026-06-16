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

function formatClockInTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-AU', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

export function ClockWidget({ activeEntry, locale }: ClockWidgetProps) {
  const [elapsed, setElapsed] = useState(0)
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [clockOutMsg, setClockOutMsg] = useState<string | null>(null)

  const isClockedIn = activeEntry !== null
  const pt = locale === 'pt'

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
    const sessionStart = new Date(activeEntry.clock_in).getTime()
    startTransition(async () => {
      try {
        await clockOutAction(activeEntry.id)
        const durationMs = Date.now() - sessionStart
        const totalMin = Math.round(durationMs / 60000)
        const h = Math.floor(totalMin / 60)
        const m = totalMin % 60
        const durationStr = h > 0 ? `${h}h ${m}min` : `${m}min`
        const msg = pt
          ? `Sessão encerrada · ${durationStr} registrados`
          : `Session ended · ${durationStr} logged`
        setClockOutMsg(msg)
        setTimeout(() => setClockOutMsg(null), 4000)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error')
      }
    })
  }

  return (
    <div style={{
      background: 'linear-gradient(145deg, #4B1A77 0%, #2A1153 60%, #190A38 100%)',
      borderRadius: 16,
      padding: 24,
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* decorative gold glow */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 120, height: 120, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(251,182,21,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={15} style={{ opacity: 0.65 }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', opacity: 0.7, textTransform: 'uppercase' }}>
            {pt ? 'Controle de Ponto' : 'Time Clock'}
          </span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 999,
          background: isClockedIn ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.08)',
          border: `1px solid ${isClockedIn ? 'rgba(74,222,128,0.35)' : 'rgba(255,255,255,0.15)'}`,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: isClockedIn ? '#4ade80' : 'rgba(255,255,255,0.35)',
            animation: isClockedIn ? 'cw-pulse 1.5s ease-in-out infinite' : 'none',
          }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', opacity: isClockedIn ? 1 : 0.55 }}>
            {isClockedIn ? (pt ? 'ATIVO' : 'CLOCKED IN') : (pt ? 'PRONTO' : 'READY')}
          </span>
        </div>
      </div>

      {isClockedIn ? (
        <>
          {/* Elapsed time ring */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
            <div style={{
              width: 144, height: 144, borderRadius: '50%',
              border: '1px solid rgba(251,182,21,0.22)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'inset 0 0 28px rgba(251,182,21,0.05), 0 0 28px rgba(251,182,21,0.04)',
              marginBottom: 8,
            }}>
              <div style={{
                fontSize: 26, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                color: '#FBB615', letterSpacing: '0.04em', lineHeight: 1,
              }}>
                {formatElapsed(elapsed)}
              </div>
              <div style={{ fontSize: 10, opacity: 0.45, marginTop: 7, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {pt ? 'decorrido' : 'elapsed'}
              </div>
            </div>
            {activeEntry?.clock_in && (
              <div style={{ fontSize: 12, opacity: 0.5, letterSpacing: '0.01em' }}>
                {pt ? 'desde' : 'since'} {formatClockInTime(activeEntry.clock_in)}
              </div>
            )}
          </div>

          {activeEntry?.description && (
            <div style={{
              fontSize: 12, opacity: 0.68, marginBottom: 16,
              padding: '7px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontStyle: 'italic',
            }}>
              {activeEntry.description}
            </div>
          )}

          <button
            onClick={handleClockOut}
            disabled={isPending}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '11px 0', borderRadius: 10,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.22)',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: isPending ? 'not-allowed' : 'pointer',
              opacity: isPending ? 0.6 : 1,
            }}
          >
            <Square size={13} fill="currentColor" />
            {isPending ? '...' : (pt ? 'Bater Ponto Saída' : 'Clock Out')}
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 13, opacity: 0.55, marginBottom: 16, textAlign: 'center', paddingTop: 4 }}>
            {pt ? 'Nenhum turno ativo' : 'No active shift'}
          </div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleClockIn() }}
            placeholder={pt ? 'Descrição (opcional)' : 'Description (optional)'}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', fontSize: 13, outline: 'none',
              marginBottom: 12, boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleClockIn}
            disabled={isPending}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '11px 0', borderRadius: 10,
              background: isPending ? 'rgba(251,182,21,0.7)' : '#FBB615',
              border: 'none', color: '#1a0a00',
              fontSize: 14, fontWeight: 700,
              cursor: isPending ? 'not-allowed' : 'pointer',
            }}
          >
            <Clock size={15} />
            {isPending ? '...' : (pt ? 'Bater Ponto Entrada' : 'Clock In')}
          </button>
        </>
      )}

      {error && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#fca5a5', textAlign: 'center' }}>{error}</div>
      )}

      {clockOutMsg && (
        <div style={{
          marginTop: 12, padding: '8px 12px', borderRadius: 8,
          background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)',
          fontSize: 12, color: '#4ade80', textAlign: 'center', fontWeight: 600,
        }}>
          {clockOutMsg}
        </div>
      )}

      <style>{`
        @keyframes cw-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.5); }
          50% { box-shadow: 0 0 0 5px rgba(74,222,128,0); }
        }
      `}</style>
    </div>
  )
}
