import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { publicEnv } from '@/lib/env';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
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
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.user_metadata?.role === 'admin') {
        return NextResponse.redirect(`${origin}/admin`);
      }

      if (user) {
        const { data: student } = await supabase
          .from('students')
          .select('status, access_until, is_blacklisted, onboarding_completed_at')
          .eq('auth_user_id', user.id)
          .single();

        if (!student) {
          return NextResponse.redirect(`${origin}/login?reason=not-registered`);
        }

        if (student.is_blacklisted) {
          return NextResponse.redirect(`${origin}/login?reason=blacklisted`);
        }

        if (student.status === 'expired' || (student.access_until && new Date(student.access_until) < new Date())) {
          return NextResponse.redirect(`${origin}/login?reason=expired`);
        }

        if (student.status === 'archived') {
          return NextResponse.redirect(`${origin}/login?reason=archived`);
        }

        if (student.status === 'pending' && !student.onboarding_completed_at) {
          return NextResponse.redirect(`${origin}/login?reason=not-registered`);
        }

        if (student.status !== 'certified' && student.status !== 'pending') {
          return NextResponse.redirect(`${origin}/login?reason=not-registered`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
