import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const handleI18nRouting = createIntlMiddleware(routing)

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

  // Run i18n routing first
  const i18nResponse = handleI18nRouting(request)

  // Build a response we can attach cookies to
  const response = i18nResponse ?? NextResponse.next({ request })

  const isPublic =
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

  // Refresh session — IMPORTANT: must be getUser(), not getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
