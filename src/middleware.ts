import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const ONBOARDING_TOKEN = process.env.ONBOARDING_TOKEN || 'WFD_TRAINING_2026';

function onboardingUrl(base: string, extra: string = '') {
  const url = new URL(`/onboarding?token=${ONBOARDING_TOKEN}${extra}`, base);
  return url;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
    const role = user.user_metadata?.role;
    if (role !== 'admin' && role !== 'preceptor') {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const role = user.user_metadata?.role;
    if (role === 'admin' || role === 'preceptor') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    const { data: student } = await supabase
      .from('students')
      .select('status, access_until, is_blacklisted')
      .eq('id', user.id)
      .single();

    if (!student) {
      return NextResponse.redirect(onboardingUrl(request.url));
    }

    if (student.is_blacklisted) {
      return NextResponse.redirect(onboardingUrl(request.url, '&status=blacklisted'));
    }

    if (student.status === 'expired' || (student.access_until && new Date(student.access_until) < new Date())) {
      return NextResponse.redirect(onboardingUrl(request.url, '&status=expired'));
    }

    if (student.status !== 'certified' && student.status !== 'pending') {
      return NextResponse.redirect(onboardingUrl(request.url));
    }
  }

  if (pathname.startsWith('/onboarding')) {
    const token = request.nextUrl.searchParams.get('token');
    if (token !== ONBOARDING_TOKEN) {
      return new NextResponse('Access Denied', { status: 403 });
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/onboarding/:path*', '/dashboard/:path*', '/admin/:path*'],
};
