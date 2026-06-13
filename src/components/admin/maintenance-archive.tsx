'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function MaintenanceArchive() {
  const [exported, setExported] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purgeDone, setPurgeDone] = useState(false);

  const supabase = createClient();

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
    try {
      await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('admin_notes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('evaluations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      setPurgeDone(true);
    } catch {}
    setPurging(false);
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
          <p className="text-sm text-green-600 mt-2">Export downloaded successfully.</p>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="font-bold text-red-700 mb-4">Purge Data</h3>
        <p className="text-sm text-gray-500 mb-4">
          Delete all student data (students, schedules, evaluations, messages, notes).
          Preceptors and audit logs will be preserved. You must download the master export first.
        </p>
        {!exported ? (
          <p className="text-sm text-orange-600 font-medium">
            Download the master export above to enable data purge.
          </p>
        ) : purgeDone ? (
          <p className="text-sm text-green-600 font-medium">Data successfully purged.</p>
        ) : (
          <Button variant="danger" onClick={handlePurge} loading={purging}>
            Purge All Student Data
          </Button>
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
