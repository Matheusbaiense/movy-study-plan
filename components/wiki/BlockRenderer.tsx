'use client'

import { StepsBlock } from './blocks/StepsBlock'
import { ChecklistBlock } from './blocks/ChecklistBlock'
import { InfoBox } from './blocks/InfoBox'
import { EmailTemplate } from './blocks/EmailTemplate'
import { TableBlock } from './blocks/TableBlock'
import type { Block } from '@/types/blocks'

interface Props {
  blocks: Block[]
  contentId: string
  initialChecked?: Record<string, string[]>
}

export function BlockRenderer({ blocks, contentId, initialChecked = {} }: Props) {
  return (
    <div>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'text':
            return (
              <div
                key={i}
                style={{ fontSize: 14, lineHeight: 1.7, color: '#03182D' }}
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
            )
          case 'steps':
            return <StepsBlock key={i} block={block} />
          case 'checklist':
            return (
              <ChecklistBlock
                key={i}
                block={block}
                contentId={contentId}
                initialChecked={initialChecked[block.id]}
              />
            )
          case 'infobox':
            return <InfoBox key={i} block={block} />
          case 'email':
            return <EmailTemplate key={i} block={block} />
          case 'table':
            return <TableBlock key={i} block={block} />
          case 'section':
            return (
              <section key={i} style={{ margin: '28px 0' }}>
                <h3 style={{
                  fontSize: 16, fontWeight: 600, color: '#03182D',
                  paddingBottom: 8, borderBottom: '1px solid rgba(3,24,45,0.1)',
                  marginBottom: 16,
                }}>
                  {block.title}
                </h3>
                <BlockRenderer
                  blocks={block.children}
                  contentId={contentId}
                  initialChecked={initialChecked}
                />
              </section>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
