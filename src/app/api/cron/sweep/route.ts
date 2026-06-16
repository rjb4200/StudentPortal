import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createAdminClient();

  const { data: expired } = await supabase
    .from('students')
    .select('id')
    .lt('access_until', new Date().toISOString())
    .neq('status', 'expired')
    .neq('status', 'archived');

  if (expired && expired.length > 0) {
    const ids = expired.map((s) => s.id);
    await supabase
      .from('students')
      .update({ status: 'expired' })
      .in('id', ids);

    await supabase.from('audit_log').insert({
      action: `Cron sweep: expired ${ids.length} students`,
      performed_by: 'system',
    });
  }

  return NextResponse.json({
    expired: expired?.length ?? 0,
    timestamp: new Date().toISOString(),
  });
}
