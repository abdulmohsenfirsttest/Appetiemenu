import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isAdminLogin = pathname === '/admin/login'
  const isAdminRoute = pathname.startsWith('/admin')
  const isManagerLogin = pathname === '/manager/login'
  const isManagerRoute = pathname.startsWith('/manager')

  // Role lives in the account's auth metadata: 'manager', 'admin', or none.
  const role = (user?.app_metadata as { role?: string } | undefined)?.role
  // asjad@appetie.com is always treated as a manager (safety fallback).
  const isManagerOnly = !!user && role !== 'admin' && (role === 'manager' || user.email === 'asjad@appetie.com')
  const canAccessManager = !!user && (role === 'manager' || role === 'admin' || user.email === 'asjad@appetie.com')

  // Admin routes — manager-only users may NOT enter
  if (isAdminRoute && !isAdminLogin && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  if (isAdminRoute && !isAdminLogin && isManagerOnly) {
    return NextResponse.redirect(new URL('/manager', request.url))
  }
  if (isAdminLogin && user && isManagerOnly) {
    return NextResponse.redirect(new URL('/manager', request.url))
  }
  if (isAdminLogin && user && !isManagerOnly) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Manager routes — managers and admins may enter
  if (isManagerRoute && !isManagerLogin && !user) {
    return NextResponse.redirect(new URL('/manager/login', request.url))
  }
  if (isManagerRoute && !isManagerLogin && !canAccessManager) {
    return NextResponse.redirect(new URL('/manager/login', request.url))
  }
  if (isManagerLogin && canAccessManager) {
    return NextResponse.redirect(new URL('/manager', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/manager/:path*'],
}
