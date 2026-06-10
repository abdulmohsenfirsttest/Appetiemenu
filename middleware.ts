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

  // Admin routes — operation manager (asjad@appetie.com) may NOT enter
  if (isAdminRoute && !isAdminLogin && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  if (isAdminRoute && !isAdminLogin && user && user.email === 'asjad@appetie.com') {
    return NextResponse.redirect(new URL('/manager', request.url))
  }
  if (isAdminLogin && user && user.email !== 'asjad@appetie.com') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }
  if (isAdminLogin && user && user.email === 'asjad@appetie.com') {
    return NextResponse.redirect(new URL('/manager', request.url))
  }

  // Manager routes — only asjad@appetie.com may enter
  if (isManagerRoute && !isManagerLogin && !user) {
    return NextResponse.redirect(new URL('/manager/login', request.url))
  }
  if (isManagerRoute && !isManagerLogin && user && user.email !== 'asjad@appetie.com') {
    return NextResponse.redirect(new URL('/manager/login', request.url))
  }
  if (isManagerLogin && user && user.email === 'asjad@appetie.com') {
    return NextResponse.redirect(new URL('/manager', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/manager/:path*'],
}
