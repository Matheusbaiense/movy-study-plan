'use client'

import { useState } from 'react'
import type { EmailBlock } from '@/types/blocks'

export function EmailTemplate({ block }: { block: EmailBlock }) {
  const [copied, setCopied] = useState(false)

  const copyBody = () => {
    navigator.clipboard.writeText(block.body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div style={{
      display: 'flex', gap: 8, padding: '6px 14px',
      borderBottom: '1px solid rgba(28,18,51,0.06)',
    }}>
      <span style={{
        fontSize: 11, fontWeight: 700, color: 'rgba(28,18,51,0.4)',
        width: 60, flexShrink: 0, paddingTop: 2,
      }}>
        {label}
      </span>
      <span style={{ fontSize: 13, color: '#2A1153' }}>{value}</span>
    </div>
  )

  return (
    <div style={{
      margin: '20px 0', borderRadius: 12,
      border: '1px solid rgba(28,18,51,0.1)', overflow: 'hidden',
      fontFamily: 'Outfit, sans-serif',
    }}>
      <div style={{
        background: '#2A1153', padding: '8px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: 'rgba(249,249,249,0.7)',
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          {block.label ?? 'Template de Email'}
        </span>
        <button
          onClick={copyBody}
          style={{
            fontSize: 11, color: copied ? '#4B1A77' : '#F36B1C',
            background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontFamily: 'Outfit, sans-serif',
          }}
        >
          {copied ? '✓ Copiado!' : 'Copiar corpo'}
        </button>
      </div>
      {block.from && <Row label="DE" value={block.from} />}
      {block.to && <Row label="PARA" value={block.to} />}
      {block.cc && <Row label="CC" value={block.cc} />}
      <Row label="ASSUNTO" value={block.subject} />
      <div style={{
        padding: '14px', whiteSpace: 'pre-wrap',
        fontSize: 13, color: '#2A1153', lineHeight: 1.7,
        background: '#FAFAFA',
      }}>
        {block.body}
      </div>
    </div>
  )
}
