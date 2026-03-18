import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { supabaseEnv } from './env'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request
  })

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
          response = NextResponse.next({
            request
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const isPortalRoute = request.nextUrl.pathname.startsWith('/portal')
  const isPortalLoginRoute = request.nextUrl.pathname.startsWith('/portal/login')

  if (isPortalRoute && !isPortalLoginRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/portal/login'
    return NextResponse.redirect(url)
  }

  return response
}
