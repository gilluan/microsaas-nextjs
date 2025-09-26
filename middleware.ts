import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/api/auth/logout'
]

// Routes that should redirect authenticated users away
const authRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password'
]

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/about',
  '/pricing',
  '/contact',
  '/terms',
  '/privacy'
]

/**
 * Check if user is authenticated by looking for auth tokens
 * This is a simplified check - in production you might want to verify the token
 */
function isAuthenticated(request: NextRequest): boolean {
  // Check for Amplify auth tokens in cookies
  const amplifyTokens = [
    'CognitoIdentityServiceProvider',
    'amplify-signin-with-hostedUI'
  ]

  return amplifyTokens.some(tokenPrefix => {
    return Array.from(request.cookies.keys()).some(key =>
      key.includes(tokenPrefix)
    )
  })
}

/**
 * Get the appropriate redirect URL based on the request
 */
function getRedirectUrl(request: NextRequest, path: string): URL {
  const url = new URL(path, request.url)

  // Preserve the original URL as a redirect parameter for auth routes
  if (path === '/login' && request.nextUrl.pathname !== '/login') {
    url.searchParams.set('redirect', request.nextUrl.pathname)
  }

  return url
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isUserAuthenticated = isAuthenticated(request)

  // Skip middleware for static files and API routes (except auth)
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isUserAuthenticated) {
      // Redirect to login with the current path as redirect parameter
      const loginUrl = getRedirectUrl(request, '/login')
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Handle auth routes (login, register, etc.)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isUserAuthenticated) {
      // Check for redirect parameter
      const redirectTo = request.nextUrl.searchParams.get('redirect')
      const redirectUrl = redirectTo && redirectTo !== '/login'
        ? getRedirectUrl(request, redirectTo)
        : getRedirectUrl(request, '/dashboard')

      return NextResponse.redirect(redirectUrl)
    }
    return NextResponse.next()
  }

  // Handle public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Default behavior for unknown routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes that don't need auth middleware)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}