import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { publicEnv } from '@/lib/env';
import { canAccessAdmin } from '@/lib/roles';
import packageInfo from '../../../../../package.json';

export const dynamic = 'force-dynamic';

const CRON_SWEEP_JOB = 'cron_sweep';
const CRON_STALE_MS = 26 * 60 * 60 * 1000;

type CheckStatus = 'healthy' | 'warning' | 'attention' | 'unknown';

type Alert = {
  level: 'info' | 'warning' | 'attention';
  title: string;
  message: string;
};

function authClientFromRequest(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  return createServerClient(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieHeader.split(';').map(c => { const [name, ...rest] = c.trim().split('='); return { name, value: rest.join('=') }; }), setAll: () => {} } }
  );
}

async function countRows(supabase: ReturnType<typeof createAdminClient>, table: string, build?: (query: any) => any) {
  const base = (supabase as any).from(table).select('id', { count: 'exact', head: true });
  const query = build ? build(base) : base;
  const { count, error } = await query;
  if (error) throw new Error(`Failed to count ${table}: ${error.message}`);
  return count ?? 0;
}

async function getStorageUsage(supabase: ReturnType<typeof createAdminClient>) {
  const { data, error } = await (supabase as any).rpc('get_storage_usage_summary');

  if (error) throw new Error(error.message);

  const buckets = (data ?? []).map((row: any) => ({
    bucketId: row.bucket_id ?? 'unknown',
    objectCount: Number(row.object_count ?? 0),
    bytes: Number(row.bytes ?? 0),
  }));

  return {
    buckets,
    objectCount: buckets.reduce((sum: number, bucket: { objectCount: number }) => sum + bucket.objectCount, 0),
    bytes: buckets.reduce((sum: number, bucket: { bytes: number }) => sum + bucket.bytes, 0),
  };
}

function envCheck(name: string, required: boolean) {
  const configured = Boolean(process.env[name]);
  return { name, required, configured };
}

export async function GET(request: NextRequest) {
  const authClient = authClientFromRequest(request);
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createAdminClient();
  const alerts: Alert[] = [];

  const databaseStart = Date.now();
  let databaseCheck: { status: CheckStatus; latencyMs: number; checkedAt: string; error?: string };
  try {
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), 5000));
    const query = supabase.from('audit_log').select('id').limit(1);
    const { error } = await Promise.race([query, timeout]);
    if (error) throw error;
    databaseCheck = { status: 'healthy', latencyMs: Date.now() - databaseStart, checkedAt: new Date().toISOString() };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database check failed';
    databaseCheck = { status: 'attention', latencyMs: Date.now() - databaseStart, checkedAt: new Date().toISOString(), error: message };
    alerts.push({ level: 'attention', title: 'Database check failed', message });
  }

  const env = [
    envCheck('NEXT_PUBLIC_SUPABASE_URL', true),
    envCheck('NEXT_PUBLIC_SUPABASE_ANON_KEY', true),
    envCheck('NEXT_PUBLIC_SITE_URL', true),
    envCheck('SUPABASE_SERVICE_ROLE_KEY', true),
    envCheck('CRON_SECRET', true),
    envCheck('RESEND_API_KEY', false),
  ];

  for (const item of env) {
    if (item.required && !item.configured) {
      alerts.push({ level: 'attention', title: 'Missing required configuration', message: `${item.name} is not configured.` });
    }
  }

  if (!process.env.RESEND_API_KEY) {
    alerts.push({ level: 'warning', title: 'Email is not configured', message: 'RESEND_API_KEY is missing, so transactional email sends will fail.' });
  } else {
    alerts.push({ level: 'info', title: 'Email delivery history not tracked', message: 'Email is configured, but durable delivery failure telemetry is not implemented yet.' });
  }

  let metrics = {
    activeStudents: 0,
    pendingApprovals: 0,
    activeInstructors: 0,
    activeTrainingSites: 0,
  };

  try {
    const [activeStudents, pendingApprovals, activeInstructors, activeTrainingSites] = await Promise.all([
      countRows(supabase, 'students', (query) => query.eq('status', 'certified')),
      countRows(supabase, 'students', (query) => query.eq('status', 'pending').not('onboarding_completed_at', 'is', null)),
      countRows(supabase, 'instructors', (query) => query.eq('status', 'active')),
      countRows(supabase, 'training_sites', (query) => query.eq('status', 'active')),
    ]);
    metrics = { activeStudents, pendingApprovals, activeInstructors, activeTrainingSites };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load summary metrics';
    alerts.push({ level: 'warning', title: 'Summary metrics unavailable', message });
  }

  let storage: { status: CheckStatus; buckets: { bucketId: string; objectCount: number; bytes: number }[]; objectCount: number; bytes: number; error?: string };
  try {
    storage = { status: 'healthy', ...(await getStorageUsage(supabase)) };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Storage usage unavailable';
    storage = { status: 'warning', buckets: [], objectCount: 0, bytes: 0, error: message };
    alerts.push({ level: 'warning', title: 'Storage usage unavailable', message });
  }

  const [{ data: latestJob }, { data: lastSuccess }, { data: lastFailure }, { data: recentFailures }, { data: recentAudit }] = await Promise.all([
    supabase.from('system_job_runs').select('*').eq('job_name', CRON_SWEEP_JOB).order('started_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('system_job_runs').select('*').eq('job_name', CRON_SWEEP_JOB).eq('status', 'success').order('started_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('system_job_runs').select('*').eq('job_name', CRON_SWEEP_JOB).eq('status', 'failure').order('started_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('system_job_runs').select('id, job_name, status, started_at, error_message').eq('status', 'failure').order('started_at', { ascending: false }).limit(5),
    supabase.from('audit_log').select('id, action, performed_by, timestamp').order('timestamp', { ascending: false }).limit(8),
  ]);

  const lastSuccessTime = lastSuccess?.finished_at ? new Date(lastSuccess.finished_at).getTime() : null;
  const stale = lastSuccessTime === null || Date.now() - lastSuccessTime > CRON_STALE_MS;
  const latestFailed = latestJob?.status === 'failure';
  const expiredCount = typeof lastSuccess?.summary === 'object' && lastSuccess.summary && !Array.isArray(lastSuccess.summary)
    ? Number((lastSuccess.summary as Record<string, unknown>).expired ?? 0)
    : 0;

  if (!latestJob) {
    alerts.push({ level: 'warning', title: 'Cron sweep has no run history', message: 'No daily expiration sweep run has been recorded yet.' });
  } else if (latestFailed) {
    alerts.push({ level: 'attention', title: 'Cron sweep failed', message: lastFailure?.error_message ?? 'The latest daily expiration sweep failed.' });
  } else if (stale) {
    alerts.push({ level: 'warning', title: 'Cron sweep is stale', message: 'No successful daily expiration sweep has been recorded in the last 26 hours.' });
  }

  const hasAttention = alerts.some((alert) => alert.level === 'attention') || databaseCheck.status === 'attention';
  const hasWarning = alerts.some((alert) => alert.level === 'warning') || storage.status === 'warning';

  return NextResponse.json({
    overallStatus: hasAttention ? 'attention' : hasWarning ? 'warning' : 'healthy',
    generatedAt: new Date().toISOString(),
    checks: {
      database: databaseCheck,
      storage,
      auth: {
        status: 'healthy' as CheckStatus,
        adminUser: user.email ?? user.id,
      },
      email: {
        status: process.env.RESEND_API_KEY ? 'healthy' : 'warning',
        configured: Boolean(process.env.RESEND_API_KEY),
        telemetry: 'delivery-history-not-tracked',
      },
      environment: {
        status: env.some((item) => item.required && !item.configured) ? 'attention' : 'healthy',
        variables: env,
      },
      application: {
        status: 'healthy' as CheckStatus,
        version: packageInfo.version,
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
        deployment: process.env.VERCEL_URL ?? null,
      },
    },
    jobs: {
      cronSweep: {
        status: latestFailed ? 'attention' : stale ? 'warning' : 'healthy',
        latest: latestJob,
        lastSuccess,
        lastFailure,
        stale,
        staleThresholdHours: CRON_STALE_MS / (60 * 60 * 1000),
        lastExpiredCount: Number.isFinite(expiredCount) ? expiredCount : 0,
      },
    },
    metrics,
    alerts,
    recent: {
      failures: recentFailures ?? [],
      audit: recentAudit ?? [],
    },
  });
}
