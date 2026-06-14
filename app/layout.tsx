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

// Set the theme before first paint to avoid a flash. Reads the saved choice,
// falls back to the OS preference.
const themeInit = `(function(){try{var t=localStorage.getItem('movy-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <BrandDefs />
        {children}
      </body>
    </html>
  )
}
