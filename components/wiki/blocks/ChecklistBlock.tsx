'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ChecklistBlock as ChecklistBlockType } from '@/types/blocks'

interface Props {
  block: ChecklistBlockType
  contentId: string
  initialChecked?: string[]
}

export function ChecklistBlock({ block, contentId, initialChecked = [] }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set(initialChecked))
  const total = block.items.length
  const done = checked.size

  const toggle = async (itemId: string) => {
    const next = new Set(checked)
    if (next.has(itemId)) next.delete(itemId)
    else next.add(itemId)
    setChecked(next)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('checklist_progress').upsert(
      {
        user_id: user.id,
        content_id: contentId,
        checked_items: Array.from(next),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,content_id' }
    )
  }

  return (
    <div style={{
      margin: '20px 0', background: 'var(--surface)', borderRadius: 14,
      border: '1px solid var(--border)', overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
          {block.title ?? 'Checklist'}
        </span>
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: done === total ? 'var(--movy-purple)' : 'var(--text-subtle)',
        }}>
          {done}/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'rgba(var(--ink-rgb),0.08)' }}>
        <div style={{
          height: '100%',
          width: `${total > 0 ? (done / total) * 100 : 0}%`,
          background: '#4B1A77',
          transition: 'width 0.3s',
        }} />
      </div>

      <div style={{ padding: '8px 0' }}>
        {block.items.map((item) => (
          <label
            key={item.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '9px 16px', cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={checked.has(item.id)}
              onChange={() => toggle(item.id)}
              style={{ width: 16, height: 16, accentColor: '#4B1A77', cursor: 'pointer' }}
            />
            <span style={{
              fontSize: 14, lineHeight: 1.4,
              color: checked.has(item.id) ? 'var(--text-subtle)' : 'var(--text)',
              textDecoration: checked.has(item.id) ? 'line-through' : 'none',
            }}>
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
