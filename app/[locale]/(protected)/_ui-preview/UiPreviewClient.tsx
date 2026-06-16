// app/[locale]/(protected)/_ui-preview/UiPreviewClient.tsx
'use client'

import { useState } from 'react'
import { Inbox } from 'lucide-react'
import { Button, Field, Input, Select, Textarea, PageHeader, EmptyState, Skeleton, SkeletonText, Modal, Drawer, Tabs, type TabItem } from '@/components/ui'

const PREVIEW_TABS: TabItem[] = [
  { label: 'Overview', href: '#overview' },
  { label: 'Settings', href: '#settings' },
]

export function UiPreviewClient() {
  const [modal, setModal] = useState(false)
  const [drawer, setDrawer] = useState(false)
  return (
    <div style={{ display: 'grid', gap: 32 }}>
      <PageHeader
        eyebrow="UI Preview"
        title="Primitives gallery"
        description="Temporary surface to verify the shared primitives in movy's editorial skin."
        actions={<Button variant="primary">Primary action</Button>}
      />

      <section style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="primary" loading>Loading</Button>
        <Button onClick={() => setModal(true)}>Open modal</Button>
        <Button onClick={() => setDrawer(true)}>Open drawer</Button>
      </section>

      <section className="movy-card" style={{ padding: 20, display: 'grid', gap: 14, maxWidth: 420 }}>
        <Field label="Name"><Input placeholder="Jane Doe" /></Field>
        <Field label="Role" hint="Controls access level">
          <Select defaultValue="editor">
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
          </Select>
        </Field>
        <Field label="Notes"><Textarea placeholder="..." /></Field>
      </section>

      <EmptyState icon={Inbox} title="Nothing here yet" description="When records exist they show up here." action={<Button variant="primary">Create one</Button>} />

      <section className="movy-card" style={{ padding: 20, display: 'grid', gap: 12 }}>
        <Skeleton width={180} height={20} />
        <SkeletonText lines={3} />
      </section>

      <Tabs items={PREVIEW_TABS} ariaLabel="Preview tabs" />

      <Modal open={modal} onClose={() => setModal(false)} title="Example modal">
        <p style={{ margin: 0 }}>Modal body content.</p>
      </Modal>
      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Example drawer">
        <p style={{ margin: 0 }}>Drawer body content.</p>
      </Drawer>
    </div>
  )
}
