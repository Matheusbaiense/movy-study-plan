// app/[locale]/(protected)/_ui-preview/page.tsx
import { notFound } from 'next/navigation'
import { UiPreviewClient } from './UiPreviewClient'

export default function UiPreviewPage() {
  if (process.env.MOVY_PREVIEW !== '1') notFound()
  return <UiPreviewClient />
}
