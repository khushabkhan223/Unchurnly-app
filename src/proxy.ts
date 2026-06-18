import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, createSessionToken } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'

const PROTECTED_PREFIXES = ['/dashboard', '/onboarding']
const AUTH_PAGES = ['/login', '/signup', '/']

const STATIC_EXTENSIONS = [
  '.ico', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp',
  '.css', '.js', '.woff', '.woff2', '.ttf', '.otf', '.map',
]

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Bypass static assets before any other logic
  if (STATIC_EXTENSIONS.some(ext => path.endsWith(ext)) || path.startsWith('/_next')) {
    return NextResponse.next()
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => path === p || path.startsWith(p + '/')
  )
  const isAuthPage = AUTH_PAGES.includes(path)

  if (!isProtected && !isAuthPage) return NextResponse.next()

  const cookie = (await cookies()).get('session')?.value
  const session = cookie ? await verifySessionToken(cookie) : null

  // Unauthenticated on protected route → login
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!session) return NextResponse.next()

  // Fast path: JWT already has onboardingCompleted = true — skip DB
  if (session.onboardingCompleted) {
    if (path.startsWith('/dashboard')) return NextResponse.next()
    // /onboarding or auth pages with completed session → dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Slow path: onboardingCompleted missing/false in JWT — do one DB check
  const needsCheck = path.startsWith('/dashboard') || path.startsWith('/onboarding') || isAuthPage
  if (!needsCheck) return NextResponse.next()

  const { data } = await createServerClient()
    .from('users')
    .select('onboarding_completed')
    .eq('id', session.userId)
    .maybeSingle()
  const completed = data?.onboarding_completed ?? false

  if (completed) {
    // Upgrade the JWT so future requests skip this DB call
    const newToken = await createSessionToken(session.userId, session.email, true)
    const res = path.startsWith('/dashboard')
      ? NextResponse.next()
      : NextResponse.redirect(new URL('/dashboard', request.url))
    res.cookies.set('session', newToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      secure: process.env.NODE_ENV === 'production',
    })
    return res
  }

  // Not completed
  if (path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }
  if (path.startsWith('/onboarding')) return NextResponse.next()
  // Auth pages with incomplete onboarding → onboarding
  if (isAuthPage) return NextResponse.redirect(new URL('/onboarding', request.url))

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico).*)'],
}
