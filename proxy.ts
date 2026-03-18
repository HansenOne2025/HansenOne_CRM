import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseEnv } from '@/lib/supabase/env'
import { adminAuthError, isAdminUser } from '@/lib/supabase/admin-auth'

const adminRoutePrefixes = ['/dashboard', '/companies', '/invoices', '/settings', '/api/admin']

const isAdminRoute = (pathname: string) =>
  adminRoutePrefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))

const isAdminLoginRoute = (pathname: string) => pathname === '/dashboard/login'
const isApiRoute = (pathname: string) => pathname.startsWith('/api/')

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseEnv.url,
    supabaseEnv.key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        }
      }
    }
  )

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const portalRoute = pathname.startsWith('/portal')
  const portalLoginRoute = pathname.startsWith('/portal/login')
  if (portalRoute && !portalLoginRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/portal/login'
    return NextResponse.redirect(url)
  }

  const requiresAdmin = isAdminRoute(pathname)
  if (requiresAdmin && !isAdminLoginRoute(pathname)) {
    const configError = adminAuthError()

    if (configError) {
      if (isApiRoute(pathname)) {
        return NextResponse.json({ error: configError }, { status: 500 })
      }

      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/login'
      url.searchParams.set('error', configError)
      return NextResponse.redirect(url)
    }

    const allowed = isAdminUser(user?.id)
    if (!user || !allowed) {
      if (isApiRoute(pathname)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/login'
      url.searchParams.set('next', pathname)
      if (user && !allowed) {
        url.searchParams.set('error', 'Your account is not an authorized admin.')
      }
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/portal/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/companies',
    '/companies/:path*',
    '/invoices',
    '/invoices/:path*',
    '/settings',
    '/settings/:path*',
    '/api/admin/:path*'
  ]
}
