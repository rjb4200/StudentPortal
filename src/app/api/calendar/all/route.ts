import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateICalFeed } from '@/lib/ical';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: schedules } = await supabase
    .from('schedules')
    .select('id, date, shift_type, status, students!inner(full_name)')
    .eq('status', 'approved')
    .order('date', { ascending: true });

  const feed = generateICalFeed(
    (schedules ?? []).map((s: any) => ({
      ...s,
      student_name: s.students?.full_name,
    })),
    'WFD EMS — All Students'
  );

  return new NextResponse(feed, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
      'Content-Disposition': 'inline; filename="wfd-ems-all.ics"',
    },
  });
}
