import type { InfoBoxBlock } from '@/types/blocks'

const VARIANTS = {
  tip:   { border: '#4B1A77', bg: '#4B1A77', label: '💡 Dica' },
  warn:  { border: '#F36B1C', bg: '#F36B1C', label: '⚠️ Atenção' },
  alert: { border: '#D23B2B', bg: '#D23B2B', label: '🚨 Alerta' },
  info:  { border: '#4B1A77', bg: '#4B1A77', label: 'ℹ️ Info' },
} as const

export function InfoBox({ block }: { block: InfoBoxBlock }) {
  const v = VARIANTS[block.variant]
  return (
    <div style={{
      margin: '16px 0', padding: '14px 16px', borderRadius: 10,
      borderLeft: `4px solid ${v.border}`, background: `${v.bg}0D`,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: v.border, marginBottom: 6 }}>
        {block.title ?? v.label}
      </div>
      <div
        style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    </div>
  )
}
