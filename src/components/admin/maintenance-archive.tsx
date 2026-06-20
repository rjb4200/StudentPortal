'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DAY_MS = 24 * 60 * 60 * 1000;

function getRecordAge(createdAt: string) {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return { label: 'Unknown age', stale: false };

  const ageMs = Date.now() - created.getTime();
  const hours = Math.max(0, Math.floor(ageMs / (60 * 60 * 1000)));
  const days = Math.floor(hours / 24);

  return {
    label: days > 0 ? `${days}d ${hours % 24}h old` : `${hours}h old`,
    stale: ageMs >= DAY_MS,
  };
}

export function MaintenanceArchive() {
  const [exported, setExported] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purgeDone, setPurgeDone] = useState(false);
  const [purgeError, setPurgeError] = useState<string | null>(null);
  const [abandoned, setAbandoned] = useState<any[]>([]);
  const [loadingAbandoned, setLoadingAbandoned] = useState(true);
  const [abandonedError, setAbandonedError] = useState<string | null>(null);
  const [deletingAbandoned, setDeletingAbandoned] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadAbandonedRegistrations();
  }, []);

  const loadAbandonedRegistrations = async () => {
    setLoadingAbandoned(true);
    setAbandonedError(null);
    const { data, error } = await supabase
      .from('students')
      .select('id, full_name, email, school_name, instructor_name, created_at')
      .eq('status', 'pending')
      .is('onboarding_completed_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      setAbandonedError(error.message);
      setAbandoned([]);
    } else {
      setAbandoned(data ?? []);
    }
    setLoadingAbandoned(false);
  };

  const handleMasterExport = async () => {
    setExporting(true);
    try {
      const tables = ['students', 'preceptors', 'schedules', 'evaluations', 'admin_notes', 'messages', 'audit_log'];
      const results: Record<string, any[]> = {};

      for (const table of tables) {
        const { data } = await supabase.from(table as any).select('*');
        results[table] = data ?? [];
      }

      const json = JSON.stringify(results, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wfd-ems-master-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setExported(true);
    } catch {}
    setExporting(false);
  };

  const handlePurge = async () => {
    if (!confirm('WARNING: This will permanently delete ALL student data (students, schedules, evaluations, messages, notes). Preceptors and audit logs will be preserved. Are you sure?')) {
      return;
    }
    if (!confirm('FINAL WARNING: This action cannot be undone. Proceed?')) {
      return;
    }

    setPurging(true);
    setPurgeError(null);
    try {
      await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('admin_notes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('evaluations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      setPurgeDone(true);
    } catch (e: any) {
      setPurgeError(e?.message || 'Purge failed. Some data may have been partially deleted.');
    }
    setPurging(false);
  };

  const handleDeleteAbandoned = async (student: any) => {
    if (!confirm(`Delete abandoned registration for ${student.full_name} (${student.email})? This cannot be undone.`)) {
      return;
    }
    if (!confirm('FINAL WARNING: This will permanently remove this incomplete registration. Proceed?')) {
      return;
    }

    setDeletingAbandoned(student.id);
    setAbandonedError(null);
    try {
      const res = await fetch('/api/admin/delete-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAbandonedError(data.error || `Deletion failed with status ${res.status}`);
      } else {
        await loadAbandonedRegistrations();
      }
    } catch (e: any) {
      setAbandonedError(e?.message || 'Network error during deletion.');
    }
    setDeletingAbandoned(null);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="font-bold text-wfd-charcoal mb-4">Master Export</h3>
        <p className="text-sm text-gray-500 mb-4">
          Download all data from all tables as a combined JSON export file.
        </p>
        <Button
          variant="secondary"
          onClick={handleMasterExport}
          loading={exporting}
        >
          Download Master Export
        </Button>
        {exported && (
          <p className="text-sm text-wfd-sage mt-2">Export downloaded successfully.</p>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-wfd-charcoal">Abandoned Registrations</h3>
            <p className="text-sm text-gray-500 mt-1">
              Incomplete pending registrations are kept out of Action Required and the Student Roster. Records older than 24 hours are flagged for cleanup.
            </p>
          </div>
          <Badge variant={abandoned.length > 0 ? 'gold' : 'gray'}>{abandoned.length}</Badge>
        </div>
        {abandonedError && (
          <p role="alert" className="mb-3 rounded-lg border border-wfd-crimson/20 bg-wfd-crimson/10 px-3 py-2 text-sm text-wfd-crimson">
            {abandonedError}
          </p>
        )}
        {loadingAbandoned ? (
          <p className="text-sm text-gray-500">Loading abandoned registrations...</p>
        ) : abandoned.length === 0 ? (
          <p className="text-sm text-gray-400">No abandoned registrations found.</p>
        ) : (
          <div className="space-y-2">
            {abandoned.map((student) => {
              const age = getRecordAge(student.created_at);

              return (
                <div key={student.id} className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${age.stale ? 'border-wfd-gold/50 bg-wfd-gold/10' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-wfd-charcoal truncate">{student.full_name}</p>
                      {age.stale && <Badge variant="gold">24h+</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{student.email} — {student.school_name || 'No school'} — {student.instructor_name || 'No instructor'}</p>
                    <p className="text-xs text-gray-400">Started {new Date(student.created_at).toLocaleString()} ({age.label})</p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteAbandoned(student)}
                    loading={deletingAbandoned === student.id}
                    className="shrink-0"
                  >
                    Delete
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="font-bold text-wfd-crimson mb-4">Purge Data</h3>
        <p className="text-sm text-gray-500 mb-4">
          Delete all student data (students, schedules, evaluations, messages, notes).
          Preceptors and audit logs will be preserved. You must download the master export first.
        </p>
        {!exported ? (
          <p className="text-sm text-wfd-gold font-medium">
            Download the master export above to enable data purge.
          </p>
        ) : purgeDone ? (
          <p className="text-sm text-wfd-sage font-medium">Data successfully purged.</p>
        ) : (
          <Button variant="danger" onClick={handlePurge} loading={purging}>
            Purge All Student Data
          </Button>
        )}
        {purgeError && (
          <p className="text-sm text-wfd-crimson mt-2">{purgeError}</p>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="font-bold text-wfd-charcoal mb-4">Aggregate iCal Feed</h3>
        <p className="text-sm text-gray-500 mb-2">
          Subscribe to view all active student schedules in one calendar.
        </p>
        <div className="flex items-center gap-2">
          <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
            /api/calendar/all.ics
          </code>
          <button
            onClick={() => {
              const url = `${window.location.origin}/api/calendar/all.ics`;
              navigator.clipboard.writeText(url);
            }}
            className="text-xs text-wfd-crimson hover:underline"
          >
            Copy URL
          </button>
        </div>
      </Card>
    </div>
  );
}
