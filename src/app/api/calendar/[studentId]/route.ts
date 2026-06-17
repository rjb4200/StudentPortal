import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateICalFeed } from '@/lib/ical';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;

  const supabase = createAdminClient();

  const { data: student } = await supabase
    .from('students')
    .select('full_name')
    .eq('id', studentId)
    .single();

  const { data: schedules } = await supabase
    .from('schedules')
    .select('id, date, shift_type, start_time, end_time, status')
    .eq('student_id', studentId)
    .order('date', { ascending: true });

  const ics = generateICalFeed(
    (schedules ?? []).map((s) => ({ ...s, student_name: student?.full_name })),
    student?.full_name ? `WFD EMS — ${student.full_name}` : 'WFD EMS Schedule'
  );

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
      'Content-Disposition': `inline; filename="wfd-ems-${studentId}.ics"`,
    },
  });
}
