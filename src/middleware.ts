import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { canAccessAdmin } from './lib/roles';
import { publicEnv } from './lib/env';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (!canAccessAdmin(user)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { data: student } = await supabase
      .from('students')
      .select('status, access_until, is_blacklisted, onboarding_completed_at')
      .eq('auth_user_id', user.id)
      .single();

    if (!student) {
      return NextResponse.redirect(new URL('/login?reason=not-registered', request.url));
    }

    if (student.is_blacklisted) {
      return NextResponse.redirect(new URL('/login?reason=blacklisted', request.url));
    }

    if (student.status === 'expired' || (student.access_until && new Date(student.access_until) < new Date())) {
      return NextResponse.redirect(new URL('/login?reason=expired', request.url));
    }

    if (student.status === 'archived') {
      return NextResponse.redirect(new URL('/login?reason=archived', request.url));
    }

    if (student.status === 'pending' && !student.onboarding_completed_at) {
      return NextResponse.redirect(new URL('/login?reason=not-registered', request.url));
    }

    if (student.status !== 'certified' && student.status !== 'pending') {
      return NextResponse.redirect(new URL('/login?reason=not-registered', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
