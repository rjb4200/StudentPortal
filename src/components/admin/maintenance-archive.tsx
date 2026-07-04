'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';

const DAY_MS = 24 * 60 * 60 * 1000;
const PURGE_CONFIRMATION = 'PURGE STUDENT DATA';

type AbandonedStudent = {
  id: string;
  full_name: string;
  email: string;
  school_name: string | null;
  instructor_name: string | null;
  created_at: string;
};

type PurgeSummary = {
  counts: Record<'messages' | 'admin_notes' | 'evaluations' | 'schedules' | 'students', number>;
  totalRecords: number;
  preservedCategories: string[];
};

type AuditEntry = {
  id: string;
  action: string;
  performed_by: string;
  timestamp: string;
};

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

function statusPanel(kind: 'success' | 'warning' | 'danger' | 'info', text: string) {
  const styles = {
    success: 'border-wfd-sage/30 bg-wfd-sage/10 text-wfd-sage',
    warning: 'border-wfd-gold/40 bg-wfd-gold/10 text-wfd-charcoal',
    danger: 'border-wfd-crimson/30 bg-wfd-crimson/10 text-wfd-crimson',
    info: 'border-gray-200 bg-gray-50 text-gray-600',
  };

  return <p className={`rounded-lg border px-3 py-2 text-sm ${styles[kind]}`}>{text}</p>;
}

export function MaintenanceArchive() {
  const [exported, setExported] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [purging, setPurging] = useState(false);
  const [purgeDone, setPurgeDone] = useState(false);
  const [purgeError, setPurgeError] = useState<string | null>(null);
  const [purgeSummary, setPurgeSummary] = useState<PurgeSummary | null>(null);
  const [loadingPurgeSummary, setLoadingPurgeSummary] = useState(false);
  const [purgeReason, setPurgeReason] = useState('');
  const [purgeConfirmation, setPurgeConfirmation] = useState('');
  const [abandoned, setAbandoned] = useState<AbandonedStudent[]>([]);
  const [loadingAbandoned, setLoadingAbandoned] = useState(true);
  const [abandonedError, setAbandonedError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AbandonedStudent | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deletingAbandoned, setDeletingAbandoned] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [loadingAudit, setLoadingAudit] = useState(true);
  const [mouTemplateBody, setMouTemplateBody] = useState('');
  const [mouSignerName, setMouSignerName] = useState('');
  const [mouSignerTitle, setMouSignerTitle] = useState('');
  const [mouSignerOrg, setMouSignerOrg] = useState('');
  const [savingMouSettings, setSavingMouSettings] = useState(false);
  const [mouSettingsMsg, setMouSettingsMsg] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadAbandonedRegistrations();
    loadAuditEntries();
    loadMouSettings();
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
      setAbandoned((data ?? []) as AbandonedStudent[]);
    }
    setLoadingAbandoned(false);
  };

  const loadAuditEntries = async () => {
    setLoadingAudit(true);
    setAuditError(null);
    try {
      const res = await fetch('/api/admin/audit-log?limit=8');
      const data = await res.json();
      if (!res.ok || data.error) {
        setAuditError(data.error || `Audit log failed with status ${res.status}`);
        setAuditEntries([]);
      } else {
        setAuditEntries(data.entries ?? []);
      }
    } catch (e: any) {
      setAuditError(e?.message || 'Unable to load audit activity.');
    }
    setLoadingAudit(false);
  };

  const loadMouSettings = async () => {
    const keys = ['mou_template_body', 'mou_wfems_signer_name', 'mou_wfems_signer_title', 'mou_wfems_signer_organization'];
    const { data } = await supabase.from('portal_settings').select('key, value').in('key', keys);
    const settings: Record<string, string> = {};
    for (const row of data ?? []) {
      settings[row.key] = row.value;
    }
    setMouTemplateBody(settings.mou_template_body ?? '');
    setMouSignerName(settings.mou_wfems_signer_name ?? 'James Brown');
    setMouSignerTitle(settings.mou_wfems_signer_title ?? 'EMS Major');
    setMouSignerOrg(settings.mou_wfems_signer_organization ?? 'Winchester Fire/EMS');
  };

  const saveMouSettings = async () => {
    setSavingMouSettings(true);
    setMouSettingsMsg(null);
    const settings: Record<string, string> = {
      mou_template_body: mouTemplateBody,
      mou_wfems_signer_name: mouSignerName,
      mou_wfems_signer_title: mouSignerTitle,
      mou_wfems_signer_organization: mouSignerOrg,
    };
    let hasError = false;
    for (const [key, value] of Object.entries(settings)) {
      const { error } = await supabase.from('portal_settings').upsert({ key, value }, { onConflict: 'key' });
      if (error) {
        setMouSettingsMsg(`Error saving ${key}: ${error.message}`);
        hasError = true;
        break;
      }
    }
    if (!hasError) setMouSettingsMsg('MOU settings saved.');
    setSavingMouSettings(false);
  };

  const handleMasterExport = async () => {
    setExporting(true);
    setExportError(null);
    setExportStatus('Preparing master export...');
    setPurgeDone(false);
    try {
      const tables = ['students', 'training_sites', 'instructors', 'training_classes', 'preceptors', 'schedules', 'evaluations', 'admin_notes', 'messages', 'audit_log'];
      const results: Record<string, any[]> = {};

      for (const table of tables) {
        setExportStatus(`Exporting ${table.replaceAll('_', ' ')}...`);
        const { data, error } = await supabase.from(table as any).select('*');
        if (error) throw new Error(`Failed to export ${table}: ${error.message}`);
        results[table] = data ?? [];
      }

      const exportDate = new Date().toISOString().split('T')[0];
      const filename = `wfd-ems-master-export-${exportDate}.json`;
      const json = JSON.stringify(results, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      setExported(true);
      setExportStatus(`Export complete: ${filename}`);
      await loadPurgeSummary();
    } catch (e: any) {
      setExported(false);
      setPurgeSummary(null);
      setExportStatus(null);
      setExportError(e?.message || 'Export failed. Purge remains locked.');
    }
    setExporting(false);
  };

  const loadPurgeSummary = async () => {
    setLoadingPurgeSummary(true);
    setPurgeError(null);
    try {
      const res = await fetch('/api/admin/maintenance/purge');
      const data = await res.json();
      if (!res.ok || data.error) {
        setPurgeError(data.error || `Dry-run failed with status ${res.status}`);
        setPurgeSummary(null);
      } else {
        setPurgeSummary(data);
      }
    } catch (e: any) {
      setPurgeError(e?.message || 'Unable to load purge dry-run summary.');
    }
    setLoadingPurgeSummary(false);
  };

  const handlePurge = async () => {
    setPurging(true);
    setPurgeError(null);
    try {
      const res = await fetch('/api/admin/maintenance/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exportConfirmed: exported,
          dryRunReviewed: Boolean(purgeSummary),
          confirmation: purgeConfirmation,
          reason: purgeReason,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setPurgeError(data.error || `Purge failed with status ${res.status}`);
      } else {
        setPurgeDone(true);
        setPurgeSummary(data.summary ?? purgeSummary);
        setPurgeReason('');
        setPurgeConfirmation('');
        await Promise.all([loadAbandonedRegistrations(), loadAuditEntries()]);
      }
    } catch (e: any) {
      setPurgeError(e?.message || 'Network error during purge.');
    }
    setPurging(false);
  };

  const openDeleteModal = (student: AbandonedStudent) => {
    setDeleteTarget(student);
    setDeleteReason('');
    setDeleteConfirmation('');
    setAbandonedError(null);
    setDeleteSuccess(null);
  };

  const handleDeleteAbandoned = async () => {
    if (!deleteTarget) return;
    setDeletingAbandoned(true);
    setAbandonedError(null);
    try {
      const res = await fetch('/api/admin/delete-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: deleteTarget.id,
          context: 'abandoned-registration',
          reason: deleteReason,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAbandonedError(data.error || `Deletion failed with status ${res.status}`);
      } else {
        setDeleteSuccess(`Deleted abandoned registration for ${deleteTarget.email}.`);
        setDeleteTarget(null);
        await Promise.all([loadAbandonedRegistrations(), loadAuditEntries()]);
      }
    } catch (e: any) {
      setAbandonedError(e?.message || 'Network error during deletion.');
    }
    setDeletingAbandoned(false);
  };

  const handleCopyCalendar = async () => {
    try {
      const url = `${window.location.origin}/api/calendar/all.ics`;
      await navigator.clipboard.writeText(url);
      setCopyStatus('Aggregate calendar feed URL copied. Share only with authorized users.');
    } catch {
      setCopyStatus('Unable to copy URL. Select and copy it manually.');
    }
  };

  const canPurge = exported && Boolean(purgeSummary) && purgeReason.trim().length >= 3 && purgeConfirmation === PURGE_CONFIRMATION && !purging && !purgeDone;
  const canDelete = Boolean(deleteTarget) && deleteReason.trim().length >= 3 && deleteConfirmation === (deleteTarget?.email ?? '') && !deletingAbandoned;
  const calendarUrl = typeof window === 'undefined' ? '/api/calendar/all.ics' : `${window.location.origin}/api/calendar/all.ics`;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-wfd-charcoal p-5 text-white shadow-lg">
        <p className="font-serif text-xs uppercase tracking-[0.24em] text-wfd-gold">Maintenance Command Board</p>
        <h2 className="mt-1 font-serif text-2xl font-bold">Archive, export, and purge controls</h2>
        <p className="mt-2 max-w-3xl text-sm text-white/75">
          Routine tools are separated from irreversible actions. Review impact summaries and audit history before using the danger zone.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-l-4 border-wfd-sage p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-wfd-sage">Export</p>
            <h3 className="mt-1 font-serif text-xl font-bold text-wfd-charcoal">Master Export</h3>
            <p className="mt-2 text-sm text-gray-600">
              Download all student, schedule, evaluation, message, preceptor, audit, instructor, training site, and training class data as JSON before destructive cleanup.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button variant="sage" onClick={handleMasterExport} loading={exporting}>Download Master Export</Button>
              {exported && <Badge variant="green">Export ready</Badge>}
            </div>
            <div className="mt-4 space-y-2">
              {exportStatus && statusPanel(exported ? 'success' : 'info', exportStatus)}
              {exportError && statusPanel('danger', exportError)}
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-l-4 border-wfd-gold p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-wfd-gold">Calendar Feeds</p>
            <h3 className="mt-1 font-serif text-xl font-bold text-wfd-charcoal">Aggregate iCal Feed</h3>
            <p className="mt-2 text-sm text-gray-600">
              This feed exposes operational schedule information for all approved student shifts. Share it only with authorized admin or preceptor users.
            </p>
            <div className="mt-4 flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center">
              <code className="min-w-0 flex-1 truncate text-xs text-gray-700">{calendarUrl}</code>
              <Button type="button" size="sm" variant="secondary" onClick={handleCopyCalendar}>Copy URL</Button>
            </div>
            {copyStatus && <div className="mt-3">{statusPanel(copyStatus.startsWith('Unable') ? 'danger' : 'success', copyStatus)}</div>}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="border-l-4 border-wfd-crimson p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-wfd-crimson">MOU Configuration</p>
          <h3 className="mt-1 font-serif text-xl font-bold text-wfd-charcoal">MOU Template Body</h3>
          <p className="mt-2 text-sm text-gray-600">
            This is the body text for the Memorandum of Understanding shown to instructors during class registration. Use placeholders like {'{{'}effective_date{'}}'}, {'{{'}training_organization_name{'}}'}, {'{{'}class_name{'}}'}, {'{{'}class_start_date{'}}'}, {'{{'}ride_time_end_date{'}}'}, {'{{'}representative_name{'}}'}, {'{{'}representative_title{'}}'}, {'{{'}representative_signed_at{'}}'}, {'{{'}wfems_signer_name{'}}'}, {'{{'}wfems_signer_title{'}}'}, and {'{{'}wfems_signed_at{'}}'}.
          </p>
          <textarea
            value={mouTemplateBody}
            onChange={(e) => setMouTemplateBody(e.target.value)}
            rows={12}
            className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-mono outline-none focus:ring-2 focus:ring-wfd-crimson"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-l-4 border-wfd-charcoal p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-wfd-charcoal">WFEMS Signer</p>
          <h3 className="mt-1 font-serif text-xl font-bold text-wfd-charcoal">Default WFEMS Signer Identity</h3>
          <p className="mt-2 text-sm text-gray-600">
            These values are used when an admin signs the MOU as WFEMS. Update them when the EMS Major or signer changes.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Signer Name</label>
              <input value={mouSignerName} onChange={(e) => setMouSignerName(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Signer Title</label>
              <input value={mouSignerTitle} onChange={(e) => setMouSignerTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Organization</label>
              <input value={mouSignerOrg} onChange={(e) => setMouSignerOrg(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button type="button" onClick={saveMouSettings} loading={savingMouSettings}>Save MOU Settings</Button>
            {mouSettingsMsg && statusPanel('success', mouSettingsMsg)}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-wfd-gold">Archive Cleanup</p>
            <h3 className="mt-1 font-serif text-xl font-bold text-wfd-charcoal">Abandoned Registrations</h3>
            <p className="mt-1 text-sm text-gray-600">
              Incomplete pending registrations are listed for review. Deletion requires a reason and typed email confirmation.
            </p>
          </div>
          <Badge variant={abandoned.length > 0 ? 'gold' : 'gray'}>{abandoned.length}</Badge>
        </div>
        <div className="space-y-3">
          {deleteSuccess && statusPanel('success', deleteSuccess)}
          {abandonedError && statusPanel('danger', abandonedError)}
          {loadingAbandoned ? (
            statusPanel('info', 'Loading abandoned registrations...')
          ) : abandoned.length === 0 ? (
            statusPanel('success', 'No abandoned registrations found.')
          ) : (
            abandoned.map((student) => {
              const age = getRecordAge(student.created_at);
              return (
                <div key={student.id} className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${age.stale ? 'border-wfd-gold/50 bg-wfd-gold/10' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-wfd-charcoal">{student.full_name}</p>
                      {age.stale && <Badge variant="gold">24h+</Badge>}
                    </div>
                    <p className="truncate text-xs text-gray-500">{student.email} - {student.school_name || 'No school'} - {student.instructor_name || 'No instructor'}</p>
                    <p className="text-xs text-gray-400">Started {new Date(student.created_at).toLocaleString()} ({age.label})</p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => openDeleteModal(student)} className="shrink-0">Review Delete</Button>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card className="overflow-hidden border-wfd-crimson/30">
        <div className="bg-wfd-crimson px-5 py-4 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-wfd-gold">Danger Zone</p>
          <h3 className="mt-1 font-serif text-2xl font-bold">Purge Student Data</h3>
          <p className="mt-1 text-sm text-white/80">Irreversible bulk deletion requires export, dry-run review, reason, and typed confirmation.</p>
        </div>
        <div className="space-y-4 p-5">
          {!exported && statusPanel('warning', 'Download the master export above to unlock purge review.')}
          {exported && !purgeSummary && (
            <Button variant="secondary" onClick={loadPurgeSummary} loading={loadingPurgeSummary}>Load Dry-Run Summary</Button>
          )}
          {loadingPurgeSummary && statusPanel('info', 'Building purge dry-run summary...')}
          {purgeSummary && (
            <div className="rounded-xl border border-wfd-gold/40 bg-wfd-gold/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-serif text-lg font-bold text-wfd-charcoal">Dry-run impact summary</h4>
                <Badge variant="gold">{purgeSummary.totalRecords} records</Badge>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-5">
                {Object.entries(purgeSummary.counts).map(([table, count]) => (
                  <div key={table} className="rounded-lg bg-white p-3 text-center shadow-sm">
                    <p className="text-lg font-black text-wfd-crimson">{count}</p>
                    <p className="text-[11px] uppercase tracking-wide text-gray-500">{table.replaceAll('_', ' ')}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-600">Preserved: {purgeSummary.preservedCategories.join(', ')}</p>
            </div>
          )}
          {purgeSummary && !purgeDone && (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-wfd-charcoal">
                Reason for purge
                <textarea value={purgeReason} onChange={(e) => setPurgeReason(e.target.value)} className="mt-1 min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson" placeholder="Document why this purge is being performed." />
              </label>
              <label className="text-sm font-semibold text-wfd-charcoal">
                Type `{PURGE_CONFIRMATION}`
                <input value={purgeConfirmation} onChange={(e) => setPurgeConfirmation(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson" />
              </label>
            </div>
          )}
          {purgeDone && statusPanel('success', 'Data purge completed. Audit log was updated with the reason and impact summary.')}
          {purgeError && statusPanel('danger', purgeError)}
          {purgeSummary && !purgeDone && (
            <Button variant="danger" onClick={handlePurge} loading={purging} disabled={!canPurge}>Purge All Student Data</Button>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-wfd-sage">Audit Visibility</p>
            <h3 className="mt-1 font-serif text-xl font-bold text-wfd-charcoal">Recent Admin Activity</h3>
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={loadAuditEntries} loading={loadingAudit}>Refresh</Button>
        </div>
        {auditError && statusPanel('danger', auditError)}
        {loadingAudit ? statusPanel('info', 'Loading audit activity...') : auditEntries.length === 0 ? statusPanel('info', 'No audit entries found.') : (
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
            {auditEntries.map((entry) => (
              <div key={entry.id} className="p-3">
                <p className="text-sm font-medium text-wfd-charcoal">{entry.action}</p>
                <p className="mt-1 text-xs text-gray-500">{entry.performed_by} - {new Date(entry.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete abandoned registration">
        {deleteTarget && (
          <div className="space-y-4">
            <div className="rounded-lg border border-wfd-crimson/30 bg-wfd-crimson/10 p-3 text-sm text-wfd-charcoal">
              <p className="font-semibold text-wfd-crimson">This permanently removes an incomplete registration.</p>
              <p className="mt-1">{deleteTarget.full_name} - {deleteTarget.email}</p>
            </div>
            <label className="block text-sm font-semibold text-wfd-charcoal">
              Reason
              <textarea value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} className="mt-1 min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson" placeholder="Document why this incomplete registration is being removed." />
            </label>
            <label className="block text-sm font-semibold text-wfd-charcoal">
              Type the student email to confirm
              <input value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson" placeholder={deleteTarget.email} />
            </label>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button type="button" variant="danger" onClick={handleDeleteAbandoned} loading={deletingAbandoned} disabled={!canDelete}>Delete Registration</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
