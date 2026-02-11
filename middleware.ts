import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // FIXED: Changed shorthand 'value' to 'value: ""'
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 1. Refresh session so it's valid for this request
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Define ERP Protected Routes
  const erpPaths = [
    '/admin', 
    '/inventory', 
    '/sales', 
    '/finance', 
    '/reports', 
    '/utilities', 
    '/suppliers', 
    '/purchasing'
  ];
  
  const isErpPath = erpPaths.some(path => request.nextUrl.pathname.startsWith(path));

  // 3. Security Logic
  if (isErpPath) {
    // If not logged in, go to login
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check Profile Role from Database
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // If logged in but NOT staff/admin, kick back to shop home
    if (profile?.role !== 'admin' && profile?.role !== 'staff') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 4. If logged in users try to go to /login, send them to dashboard/home
  if (request.nextUrl.pathname === '/login' && user) {
      return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

// Ensure the middleware runs on all relevant paths
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}