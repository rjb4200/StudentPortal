import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { publicEnv } from '@/lib/env';
import { scheduleCreateBody } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  const authClient = createServerClient(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieHeader.split(';').map(c => { const [name, ...rest] = c.trim().split('='); return { name, value: rest.join('=') }; }), setAll: () => {} } }
  );

  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = scheduleCreateBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { date, shiftType, startTime, endTime } = parsed.data;
  const adminClient = createAdminClient() as any;
  const { data: student, error: studentError } = await adminClient
    .from('students')
    .select('id, status, is_blacklisted, training_classes(class_start_date, ride_time_end_date)')
    .eq('auth_user_id', user.id)
    .single();

  if (studentError || !student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }
  if (student.status !== 'certified' || student.is_blacklisted) {
    return NextResponse.json({ error: 'Student is not eligible to schedule shifts.' }, { status: 403 });
  }

  const classWindow = Array.isArray(student.training_classes) ? student.training_classes[0] : student.training_classes;
  if (classWindow && (date < classWindow.class_start_date || date > classWindow.ride_time_end_date)) {
    return NextResponse.json({ error: 'Schedule date is outside your class ride-time window.' }, { status: 400 });
  }

  const { data: block, error: blockError } = await adminClient
    .from('schedule_blocks')
    .select('date')
    .eq('date', date)
    .maybeSingle();

  if (blockError) {
    return NextResponse.json({ error: 'Unable to verify scheduling availability.' }, { status: 500 });
  }
  if (block) {
    return NextResponse.json({ error: 'This date is unavailable for scheduling.' }, { status: 400 });
  }

  const { data: schedule, error: insertError } = await adminClient
    .from('schedules')
    .insert({
      student_id: student.id,
      date,
      shift_type: shiftType,
      start_time: startTime,
      end_time: endTime,
      status: 'pending',
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, schedule });
}
