import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateICalFeed } from '@/lib/ical';

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId: rawParam } = await params;
  const param = rawParam.endsWith('.ics') ? rawParam.slice(0, -4) : rawParam;
  const supabase = createAdminClient();

  // Try token-based lookup first
  if (isUuid(param)) {
    const { data: feed } = await supabase
      .from('calendar_feeds')
      .select('*')
      .eq('token', param)
      .maybeSingle();

    if (feed) {
      let schedules: any[] | null = null;
      let calendarName = 'WFD EMS Schedule';

      if (feed.feed_type === 'student') {
        const studentId = feed.entity_id!;
        const { data: student } = await supabase
          .from('students')
          .select('full_name')
          .eq('id', studentId)
          .single();

        const { data: studentSchedules } = await supabase
          .from('schedules')
          .select('id, date, shift_type, start_time, end_time, status')
          .eq('student_id', studentId)
          .order('date', { ascending: true });

        schedules = (studentSchedules ?? []).map((s) => ({ ...s, student_name: student?.full_name }));
        calendarName = student?.full_name ? `WFD EMS — ${student.full_name}` : 'WFD EMS Schedule';
      } else if (feed.feed_type === 'training_site') {
        const siteId = feed.entity_id!;
        const { data: site } = await supabase
          .from('training_sites')
          .select('name')
          .eq('id', siteId)
          .single();

        const { data: siteSchedules } = await supabase
          .from('schedules')
          .select('id, date, shift_type, start_time, end_time, status, students!inner(full_name)')
          .eq('students.training_site_id', siteId)
          .eq('status', 'approved')
          .order('date', { ascending: true });

        schedules = (siteSchedules ?? []).map((s: any) => ({
          ...s,
          student_name: s.students?.full_name,
        }));
        calendarName = site?.name ? `WFD EMS — ${site.name}` : 'WFD EMS Schedule';
      } else if (feed.feed_type === 'aggregate') {
        const { data: allSchedules } = await supabase
          .from('schedules')
          .select('id, date, shift_type, start_time, end_time, status, students!inner(full_name)')
          .eq('status', 'approved')
          .order('date', { ascending: true });

        schedules = (allSchedules ?? []).map((s: any) => ({
          ...s,
          student_name: s.students?.full_name,
        }));
        calendarName = 'WFD EMS — All Students';
      }

      if (schedules) {
        const ics = generateICalFeed(schedules, calendarName);
        return new NextResponse(ics, {
          headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Cache-Control': 'public, max-age=300, s-maxage=3600',
            'Content-Disposition': `inline; filename="wfd-ems-${param}.ics"`,
          },
        });
      }
    }
  }

  // Fall back to legacy student-ID lookup
  if (!isUuid(param)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const { data: student } = await supabase
    .from('students')
    .select('full_name')
    .eq('id', param)
    .single();

  const { data: schedules } = await supabase
    .from('schedules')
    .select('id, date, shift_type, start_time, end_time, status')
    .eq('student_id', param)
    .order('date', { ascending: true });

  const ics = generateICalFeed(
    (schedules ?? []).map((s) => ({ ...s, student_name: student?.full_name })),
    student?.full_name ? `WFD EMS — ${student.full_name}` : 'WFD EMS Schedule'
  );

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
      'Content-Disposition': `inline; filename="wfd-ems-${param}.ics"`,
    },
  });
}
