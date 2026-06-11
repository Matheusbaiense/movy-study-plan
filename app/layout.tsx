import type { Metadata, Viewport } from 'next'
import './globals.css'
import { BrandDefs } from '@/components/brand/BrandDefs'

export const metadata: Metadata = {
  title: 'Movy Internal Hub',
  description: 'Repositório interno de processos, documentos e conhecimento operacional da Movy.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2A1153',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <BrandDefs />
        {children}
      </body>
    </html>
  )
}
