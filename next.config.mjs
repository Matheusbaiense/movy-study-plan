import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const SUPABASE_ORIGIN = 'https://xpthmguzcbmndyyexfbt.supabase.co'

// CSP is shipped REPORT-ONLY first: it never blocks, it only logs violations to
// the browser console so we can tighten it safely before enforcing. The app uses
// inline styles heavily (style={{}}) and Next injects some inline scripts, hence
// 'unsafe-inline'. External FX providers (Wise, er-api, frankfurter) are called
// server-side, so connect-src only needs self + Supabase (REST + realtime wss).
const cspReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  `img-src 'self' data: blob: https://lh3.googleusercontent.com ${SUPABASE_ORIGIN}`,
  `connect-src 'self' ${SUPABASE_ORIGIN} wss://xpthmguzcbmndyyexfbt.supabase.co`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/api/imported/[name]': ['./data/imported/**/*'],
    },
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'xpthmguzcbmndyyexfbt.supabase.co',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
