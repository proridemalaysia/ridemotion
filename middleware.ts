import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname;

  // 1. ERP Paths Protection
  const erpPaths = ['/admin', '/inventory', '/sales', '/finance', '/purchasing', '/suppliers', '/utilities', '/users', '/logs'];
  const isErpPath = erpPaths.some(p => path.startsWith(p));

  if (isErpPath) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url));
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role === 'customer') return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Profile Protection (Required login but no role check)
  if (path === '/profile' && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}