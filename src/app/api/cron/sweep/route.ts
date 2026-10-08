import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Json } from '@/lib/supabase/database.types';
import { findOrphanedAuthUsers } from '@/lib/auth-provisioning';

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
      .neq('status', 'archived')
      .neq('status', 'rejected');

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

    // Orphan reconciliation: auth users with no matching profile by id or email.
    let orphansFound = 0;
    let orphansNeverSignedIn = 0;
    let orphansCleaned = 0;
    let orphanError: string | null = null;
    const cleanOrphans = process.env.CRON_SWEEP_CLEAN_ORPHANS === 'true';

    try {
      const report = await findOrphanedAuthUsers(supabase);
      orphansFound = report.total;
      orphansNeverSignedIn = report.neverSignedIn;

      if (orphansFound > 0) {
        const { error: auditError } = await supabase.from('audit_log').insert({
          action: `Cron sweep: detected ${orphansFound} orphaned auth user(s) (${orphansNeverSignedIn} never signed in)`,
          performed_by: 'system',
        });
        if (auditError) {
          console.error('Cron sweep orphan audit log failed:', auditError.message);
        }
      }

      if (cleanOrphans) {
        for (const orphan of report.orphans) {
          if (orphan.lastSignInAt) continue;
          const { error } = await supabase.auth.admin.deleteUser(orphan.id);
          if (!error) orphansCleaned += 1;
        }

        if (orphansCleaned > 0) {
          const { error: auditError } = await supabase.from('audit_log').insert({
            action: `Cron sweep: removed ${orphansCleaned} never-signed-in orphaned auth user(s)`,
            performed_by: 'system',
          });
          if (auditError) {
            console.error('Cron sweep orphan cleanup audit log failed:', auditError.message);
          }
        }
      }
    } catch (error) {
      orphanError = error instanceof Error ? error.message : 'Orphan reconciliation failed';
      console.error('Cron sweep orphan reconciliation failed:', orphanError);
    }

    const finishedAt = new Date();
    const expiredCount = expired?.length ?? 0;
    await recordJobRun(supabase, {
      status: 'success',
      startedAt,
      finishedAt,
      summary: {
        expired: expiredCount,
        orphans: orphansFound,
        orphansNeverSignedIn,
        orphansCleaned,
        ...(orphanError ? { orphanError } : {}),
      },
    });

    return NextResponse.json({
      expired: expiredCount,
      orphans: orphansFound,
      orphansNeverSignedIn,
      orphansCleaned,
      orphanError,
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
