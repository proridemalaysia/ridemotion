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

  // 1. Get the actual user from the session
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname;
  
  // Define ERP paths
  const isErpPage = path.startsWith('/admin') || 
                    path.startsWith('/inventory') || 
                    path.startsWith('/purchasing') || 
                    path.startsWith('/sales') || 
                    path.startsWith('/finance') || 
                    path.startsWith('/customers') || 
                    path.startsWith('/documents') || 
                    path.startsWith('/analysis') || 
                    path.startsWith('/reports-lhdn') || 
                    path.startsWith('/utilities') || 
                    path.startsWith('/users') || 
                    path.startsWith('/logs');

  // 2. SECURITY LOGIC
  if (isErpPage) {
    // If not logged in, go to login page
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Fetch role from DB
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // If role is customer, they are not allowed in ERP. Send to Shop.
    if (profile?.role === 'customer') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 3. If logged in user tries to go to /login, send them away
  if (path === '/login' && user) {
      return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}