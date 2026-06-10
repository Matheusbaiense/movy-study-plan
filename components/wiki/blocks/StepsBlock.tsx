'use client'

import type { StepsBlock as StepsBlockType } from '@/types/blocks'

export function StepsBlock({ block }: { block: StepsBlockType }) {
  return (
    <div style={{ margin: '20px 0' }}>
      {block.title && (
        <h4 style={{ fontSize: 14, fontWeight: 600, color: '#2A1153', marginBottom: 12 }}>
          {block.title}
        </h4>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {block.items.map((step, i) => (
          <div
            key={i}
            style={{
              display: 'flex', gap: 14, padding: '14px 16px',
              background: '#fff', borderRadius: 12,
              border: '1px solid rgba(28,18,51,0.07)',
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{
              flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
              background: '#F36B1C', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700,
            }}>
              {step.num ?? i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 14, fontWeight: 600, color: '#2A1153',
                marginBottom: step.body ? 4 : 0,
              }}>
                {step.title}
              </div>
              {step.body && (
                <div
                  style={{ fontSize: 13, color: 'rgba(28,18,51,0.6)', lineHeight: 1.5 }}
                  dangerouslySetInnerHTML={{ __html: step.body }}
                />
              )}
              {step.note && (
                <div style={{ fontSize: 12, color: '#4B1A77', marginTop: 6, fontStyle: 'italic' }}>
                  {step.note}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
