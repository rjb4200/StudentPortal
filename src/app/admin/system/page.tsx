'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminNavigation } from '@/components/admin/admin-navigation';

type Status = 'healthy' | 'warning' | 'attention' | 'unknown';

type HealthData = {
  overallStatus: Status;
  generatedAt: string;
  checks: {
    database: { status: Status; latencyMs: number; checkedAt: string; error?: string };
    storage: { status: Status; buckets: { bucketId: string; objectCount: number; bytes: number }[]; objectCount: number; bytes: number; error?: string };
    auth: { status: Status; adminUser: string };
    email: { status: Status; configured: boolean; telemetry: string };
    environment: { status: Status; variables: { name: string; required: boolean; configured: boolean }[] };
    application: { status: Status; version: string; commit: string | null; deployment: string | null };
  };
  jobs: {
    cronSweep: {
      status: Status;
      latest: JobRun | null;
      lastSuccess: JobRun | null;
      lastFailure: JobRun | null;
      stale: boolean;
      staleThresholdHours: number;
      lastExpiredCount: number;
    };
  };
  metrics: {
    activeStudents: number;
    pendingApprovals: number;
    activeInstructors: number;
    activeTrainingSites: number;
  };
  alerts: { level: 'info' | 'warning' | 'attention'; title: string; message: string }[];
  recent: {
    failures: { id: string; job_name: string; status: string; started_at: string; error_message: string | null }[];
    audit: { id: string; action: string; performed_by: string; timestamp: string }[];
  };
};

type JobRun = {
  id: string;
  job_name: string;
  status: string;
  started_at: string;
  finished_at: string;
  duration_ms: number;
  summary: Record<string, unknown> | null;
  error_message: string | null;
};

const statusStyles: Record<Status, { badge: 'green' | 'orange' | 'red' | 'gray'; label: string; panel: string }> = {
  healthy: { badge: 'green', label: 'Healthy', panel: 'border-wfd-sage/30 bg-wfd-sage/10' },
  warning: { badge: 'orange', label: 'Warning', panel: 'border-wfd-gold/40 bg-wfd-gold/10' },
  attention: { badge: 'red', label: 'Attention', panel: 'border-wfd-crimson/30 bg-wfd-crimson/10' },
  unknown: { badge: 'gray', label: 'Unknown', panel: 'border-gray-200 bg-gray-50' },
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleString();
}

function StatusBadge({ status }: { status: Status }) {
  const config = statusStyles[status] ?? statusStyles.unknown;
  return <Badge variant={config.badge}>{config.label}</Badge>;
}

function CheckCard({ title, status, detail, children }: { title: string; status: Status; detail: string; children?: React.ReactNode }) {
  return (
    <Card className={`p-4 border ${statusStyles[status]?.panel ?? statusStyles.unknown.panel}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-wfd-charcoal">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{detail}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      {children && <div className="mt-3 text-sm text-gray-600">{children}</div>}
    </Card>
  );
}

export default function SystemHealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadHealth() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/system-health', { cache: 'no-store' });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || `System health failed with status ${response.status}`);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load system health.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHealth();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wfd-crimson" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminNavigation />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wfd-charcoal">System Health</h1>
          <p className="text-sm text-gray-500">Operational status, configuration checks, and daily sweep telemetry.</p>
        </div>
        <Button type="button" variant="secondary" onClick={loadHealth} loading={loading}>
          Refresh
        </Button>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-wfd-crimson/20 bg-wfd-crimson/10 px-3 py-2 text-sm text-wfd-crimson">
          {error}
        </p>
      )}

      {data && (
        <>
          <Card className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-gray-400">Overall Status</p>
                <h2 className="mt-1 text-3xl font-black text-wfd-charcoal">{statusStyles[data.overallStatus].label}</h2>
                <p className="mt-1 text-sm text-gray-500">Generated {formatDate(data.generatedAt)}</p>
              </div>
              <StatusBadge status={data.overallStatus} />
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Active Students" value={data.metrics.activeStudents} />
            <MetricCard label="Pending Approvals" value={data.metrics.pendingApprovals} />
            <MetricCard label="Active Instructors" value={data.metrics.activeInstructors} />
            <MetricCard label="Active Training Sites" value={data.metrics.activeTrainingSites} />
          </div>

          <Card className="p-4">
            <h2 className="font-bold text-wfd-charcoal">Operational Alerts</h2>
            {data.alerts.length === 0 ? (
              <p className="mt-3 text-sm text-gray-400">No operational alerts.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {data.alerts.map((alert, index) => (
                  <div key={`${alert.title}-${index}`} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-semibold text-wfd-charcoal">{alert.title}</span>
                      <Badge variant={alert.level === 'attention' ? 'red' : alert.level === 'warning' ? 'orange' : 'gray'}>{alert.level}</Badge>
                    </div>
                    <p className="mt-1 text-gray-600">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <CheckCard title="Database" status={data.checks.database.status} detail={`${data.checks.database.latencyMs}ms latency`}>
              Checked {formatDate(data.checks.database.checkedAt)}{data.checks.database.error ? ` - ${data.checks.database.error}` : ''}
            </CheckCard>
            <CheckCard title="Authentication" status={data.checks.auth.status} detail="Admin session verified">
              Signed in as {data.checks.auth.adminUser}
            </CheckCard>
            <CheckCard title="Email Configuration" status={data.checks.email.status} detail={data.checks.email.configured ? 'RESEND_API_KEY configured' : 'RESEND_API_KEY missing'}>
              Detailed email delivery failure history is not currently tracked.
            </CheckCard>
            <CheckCard title="Application" status={data.checks.application.status} detail={`Version ${data.checks.application.version}`}>
              Commit: {data.checks.application.commit ?? 'Not available'}<br />
              Deployment: {data.checks.application.deployment ?? 'Not available'}
            </CheckCard>
          </div>

          <Card className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-bold text-wfd-charcoal">Daily Expiration Sweep</h2>
                <p className="mt-1 text-sm text-gray-500">Last cron success/failure and stale-run status.</p>
              </div>
              <StatusBadge status={data.jobs.cronSweep.status} />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SmallStat label="Last Success" value={formatDate(data.jobs.cronSweep.lastSuccess?.finished_at)} />
              <SmallStat label="Last Failure" value={formatDate(data.jobs.cronSweep.lastFailure?.finished_at)} />
              <SmallStat label="Last Duration" value={data.jobs.cronSweep.lastSuccess ? `${data.jobs.cronSweep.lastSuccess.duration_ms}ms` : 'Not recorded'} />
              <SmallStat label="Last Expired" value={String(data.jobs.cronSweep.lastExpiredCount)} />
            </div>
            {data.jobs.cronSweep.lastFailure?.error_message && (
              <p className="mt-3 rounded-lg border border-wfd-crimson/20 bg-wfd-crimson/10 px-3 py-2 text-sm text-wfd-crimson">
                Last failure: {data.jobs.cronSweep.lastFailure.error_message}
              </p>
            )}
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-wfd-charcoal">Storage Usage</h2>
                  <p className="mt-1 text-sm text-gray-500">{data.checks.storage.objectCount} objects, {formatBytes(data.checks.storage.bytes)} total.</p>
                </div>
                <StatusBadge status={data.checks.storage.status} />
              </div>
              <div className="mt-3 space-y-2">
                {data.checks.storage.buckets.length === 0 ? (
                  <p className="text-sm text-gray-400">No storage objects found or metadata unavailable.</p>
                ) : data.checks.storage.buckets.map((bucket) => (
                  <div key={bucket.bucketId} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                    <span className="font-medium text-wfd-charcoal">{bucket.bucketId}</span>
                    <span className="text-gray-500">{bucket.objectCount} objects · {formatBytes(bucket.bytes)}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-wfd-charcoal">Environment</h2>
                  <p className="mt-1 text-sm text-gray-500">Configuration presence only. Secret values are never shown.</p>
                </div>
                <StatusBadge status={data.checks.environment.status} />
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {data.checks.environment.variables.map((variable) => (
                  <div key={variable.name} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
                    <span className="font-medium text-gray-700">{variable.name}</span>
                    <Badge variant={variable.configured ? 'green' : variable.required ? 'red' : 'gray'}>
                      {variable.configured ? 'set' : variable.required ? 'missing' : 'optional'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <RecentList title="Recent Job Failures" empty="No recent job failures." items={data.recent.failures.map((item) => ({ id: item.id, title: item.job_name, detail: item.error_message ?? 'Failure recorded', time: item.started_at }))} />
            <RecentList title="Recent Audit Activity" empty="No recent audit activity." items={data.recent.audit.map((item) => ({ id: item.id, title: item.action, detail: item.performed_by, time: item.timestamp }))} />
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-wfd-charcoal">{value}</p>
    </Card>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-wfd-charcoal">{value}</p>
    </div>
  );
}

function RecentList({ title, empty, items }: { title: string; empty: string; items: { id: string; title: string; detail: string; time: string }[] }) {
  return (
    <Card className="p-4">
      <h2 className="font-bold text-wfd-charcoal">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-gray-400">{empty}</p>
      ) : (
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <p className="font-medium text-wfd-charcoal">{item.title}</p>
              <p className="text-xs text-gray-500">{item.detail} · {formatDate(item.time)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
