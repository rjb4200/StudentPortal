import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Json } from '@/lib/supabase/database.types';

export const dynamic = 'force-dynamic';

const CRON_SWEEP_JOB = 'cron_sweep';

async function recordJobRun(
  supabase: ReturnType<typeof createAdminClient>,
  params: {
    status: 'success' | 'failure';
    startedAt: Date;
    finishedAt: Date;
    summary?: Json;
    errorMessage?: string;
  }
) {
  const { error } = await supabase.from('system_job_runs').insert({
    job_name: CRON_SWEEP_JOB,
    status: params.status,
    started_at: params.startedAt.toISOString(),
    finished_at: params.finishedAt.toISOString(),
    duration_ms: Math.max(0, params.finishedAt.getTime() - params.startedAt.getTime()),
    summary: params.summary ?? {},
    error_message: params.errorMessage,
  });

  if (error) {
    console.error('Failed to record cron sweep job run:', error.message);
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expected = process.env.CRON_SECRET;

  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startedAt = new Date();
  const supabase = createAdminClient();

  try {
    const { data: expired, error: expiredError } = await supabase
      .from('students')
      .select('id')
      .lt('access_until', new Date().toISOString())
      .neq('status', 'expired')
      .neq('status', 'archived');

    if (expiredError) throw expiredError;

    if (expired && expired.length > 0) {
      const ids = expired.map((s) => s.id);
      const { error: updateError } = await supabase
        .from('students')
        .update({ status: 'expired' })
        .in('id', ids);

      if (updateError) throw updateError;

      const { error: auditError } = await supabase.from('audit_log').insert({
        action: `Cron sweep: expired ${ids.length} students`,
        performed_by: 'system',
      });

      if (auditError) {
        console.error('Cron sweep audit log failed:', auditError.message);
      }
    }

    const finishedAt = new Date();
    const expiredCount = expired?.length ?? 0;
    await recordJobRun(supabase, {
      status: 'success',
      startedAt,
      finishedAt,
      summary: { expired: expiredCount },
    });

    return NextResponse.json({
      expired: expiredCount,
      timestamp: finishedAt.toISOString(),
    });
  } catch (error) {
    const finishedAt = new Date();
    const message = error instanceof Error ? error.message : 'Cron sweep failed';

    await recordJobRun(supabase, {
      status: 'failure',
      startedAt,
      finishedAt,
      errorMessage: message,
    });

    return NextResponse.json({ error: message, timestamp: finishedAt.toISOString() }, { status: 500 });
  }
}
