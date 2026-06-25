import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

function localDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export async function GET() {
  const today = localDateString();
  const adminClient = createAdminClient() as any;

  const { data, error } = await adminClient
    .from('training_classes')
    .select('id, name, class_start_date, ride_time_end_date, training_sites!inner(id, name, organization_name, status), instructors!inner(id, first_name, last_name, status)')
    .eq('status', 'active')
    .eq('training_sites.status', 'active')
    .eq('instructors.status', 'active')
    .lte('class_start_date', today)
    .gte('ride_time_end_date', today)
    .order('class_start_date', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const options = (data ?? []).map((row: any) => {
    const site = Array.isArray(row.training_sites) ? row.training_sites[0] : row.training_sites;
    const instructor = Array.isArray(row.instructors) ? row.instructors[0] : row.instructors;
    return {
      id: row.id,
      label: `${site?.name ?? 'Training Site'} - ${row.name}`,
      className: row.name,
      siteName: site?.name ?? '',
      organizationName: site?.organization_name ?? '',
      instructorName: `${instructor?.first_name ?? ''} ${instructor?.last_name ?? ''}`.trim(),
      classStartDate: row.class_start_date,
      rideTimeEndDate: row.ride_time_end_date,
    };
  });

  return NextResponse.json({ success: true, options });
}
