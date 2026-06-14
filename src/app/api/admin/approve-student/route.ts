import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';

  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieHeader.split(';').map(c => { const [name, ...rest] = c.trim().split('='); return { name, value: rest.join('=') }; }), setAll: () => {} } }
  );

  const { data: { user } } = await authClient.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { studentId } = await request.json();
  if (!studentId) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: student } = await adminClient
    .from('students')
    .select('email, status')
    .eq('id', studentId)
    .single();

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  if (student.status !== 'pending') {
    return NextResponse.json({ success: true, message: 'Already approved' });
  }

  let authCreated = false;

  try {
    const { data: existing } = await adminClient.auth.admin.listUsers();
    const found = existing?.users?.find((u) => u.email === student.email);

    if (!found) {
      await adminClient.auth.admin.createUser({
        email: student.email,
        email_confirm: true,
        user_metadata: { role: 'student' },
      });
      authCreated = true;
    }

    const { data: authUser } = await adminClient.auth.admin.listUsers();
    const authMatch = authUser?.users?.find((u) => u.email === student.email);
    if (authMatch && authMatch.id !== studentId) {
      await adminClient.from('students').update({ id: authMatch.id }).eq('id', studentId);
    }

    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/otp?redirect_to=${encodeURIComponent(`${request.nextUrl.origin}/dashboard`)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({
        email: student.email,
        create_user: false,
      }),
    });
  } catch (e) {
    console.error('Auth error:', e);
  }

  await adminClient
    .from('students')
    .update({
      status: 'certified',
      access_until: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('id', studentId);

  return NextResponse.json({ success: true, authCreated });
}
