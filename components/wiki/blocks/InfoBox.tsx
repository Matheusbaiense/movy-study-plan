import type { InfoBoxBlock } from '@/types/blocks'

const VARIANTS = {
  tip:   { border: '#057570', bg: '#057570', label: '💡 Dica' },
  warn:  { border: '#FF8B00', bg: '#FF8B00', label: '⚠️ Atenção' },
  alert: { border: '#E72C03', bg: '#E72C03', label: '🚨 Alerta' },
  info:  { border: '#3B82F6', bg: '#3B82F6', label: 'ℹ️ Info' },
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
        style={{ fontSize: 13, color: '#03182D', lineHeight: 1.6 }}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    </div>
  )
}
