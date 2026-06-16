import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const handleI18nRouting = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const oauthCode = request.nextUrl.searchParams.get('code')
  const pathnameLocale = routing.locales.find(
    (locale) => pathname === `/${locale}` || pathname === `/${locale}/`
  )

  if (oauthCode && (pathname === '/' || pathnameLocale)) {
    const url = new URL('/auth/callback', request.url)
    url.search = request.nextUrl.search
    if (!url.searchParams.get('locale')) {
      url.searchParams.set('locale', pathnameLocale ?? routing.defaultLocale)
    }
    return NextResponse.redirect(url)
  }

  // Legacy: next-intl used to prefix OAuth callback to /pt/auth/callback, which has no Route
  // Handler. Send those hits to the real handler at /auth/callback.
  if (
    routing.locales.some(
      (l) =>
        pathname === `/${l}/auth/callback` ||
        pathname.startsWith(`/${l}/auth/callback/`)
    )
  ) {
    const url = new URL('/auth/callback', request.url)
    url.search = request.nextUrl.search
    return NextResponse.redirect(url)
  }

  // OAuth callback must bypass next-intl and auth gate so app/auth/callback/route.ts runs
  // with the ?code= query intact (no 307 to /{locale}/auth/callback before exchange).
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next({ request })
  }

  // Public JSON endpoint: live exchange rate. No i18n prefixing, no auth gate
  // (returns only a generic AUD→BRL rate; the Wise token stays server-side).
  if (pathname.startsWith('/api/fx')) {
    return NextResponse.next({ request })
  }

  // Run i18n routing first
  const i18nResponse = handleI18nRouting(request)

  // Build a response we can attach cookies to
  const response = i18nResponse ?? NextResponse.next({ request })

  // Public proposal links: /{locale}/p/{uuid-token}
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const isPublicProposal = routing.locales.some((l) => {
    if (!pathname.startsWith(`/${l}/p/`)) return false
    const token = pathname.slice(`/${l}/p/`.length).split('/')[0]
    return UUID_RE.test(token)
  })

  const isPublic =
    isPublicProposal ||
    pathname.includes('/login') ||
    pathname === '/unauthorized' ||
    pathname === '/'

  if (isPublic) {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Use getSession() here for the redirect-only check — avoids a remote JWT validation
  // round-trip on every page load. Full validation (getUser()) still happens in each
  // server component before any data is accessed.
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) {
    const locale =
      routing.locales.find((l) => pathname.startsWith(`/${l}`)) ??
      routing.defaultLocale
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
