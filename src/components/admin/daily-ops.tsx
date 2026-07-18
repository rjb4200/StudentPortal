'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { to24Hour } from '@/lib/time-formats';
import { getShiftRotation } from '@/lib/shift-rotation';
import { ShiftManagement } from '@/components/admin/shift-management';
import { Alert, ConfirmDialog, DataTable, DataTableCell, DataTableHead, DataTableRow, EmptyState, SectionCard } from '@/components/ui';

const DAY_MS = 24 * 60 * 60 * 1000;
const ROTATION_TAG_STYLES = {
  orange: 'border-orange-300 bg-orange-100 text-orange-900',
  yellow: 'border-yellow-300 bg-yellow-100 text-yellow-900',
  gray: 'border-gray-300 bg-gray-100 text-gray-700',
};

type ConfirmationAction =
  | { type: 'blacklist'; student: any }
  | { type: 'delete'; student: any; finalWarning: boolean };

function getExpirationCountdown(accessUntil: string | null | undefined) {
  if (!accessUntil) return null;

  const expiresAt = new Date(accessUntil);
  if (Number.isNaN(expiresAt.getTime())) return null;

  const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / DAY_MS));
  const variant: 'green' | 'orange' | 'red' | 'gray' =
    daysRemaining === 0 ? 'gray' : daysRemaining <= 7 ? 'red' : daysRemaining <= 30 ? 'orange' : 'green';

  return {
    daysRemaining,
    label: String(daysRemaining).padStart(3, '0'),
    title: `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining until access expiration (${expiresAt.toLocaleDateString()})`,
    variant,
  };
}

function getStudentClass(student: any) {
  return Array.isArray(student?.training_classes) ? student.training_classes[0] : student?.training_classes;
}

function getStudentClassLabel(student: any) {
  const trainingClass = getStudentClass(student);
  if (!trainingClass) return `${student.school_name ?? ''} — ${student.instructor_name ?? ''}`.trim();
  const site = Array.isArray(trainingClass.training_sites) ? trainingClass.training_sites[0] : trainingClass.training_sites;
  const instructor = Array.isArray(trainingClass.instructors) ? trainingClass.instructors[0] : trainingClass.instructors;
  const instructorName = instructor ? `${instructor.first_name ?? ''} ${instructor.last_name ?? ''}`.trim() : '';
  return [site?.name, trainingClass.name, instructorName].filter(Boolean).join(' — ');
}

export function DailyOps() {
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [approving, setApproving] = useState<string | null>(null);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [quizFlags, setQuizFlags] = useState<any[]>([]);
  const [registryItems, setRegistryItems] = useState<any[]>([]);
  const [registryActioning, setRegistryActioning] = useState<string | null>(null);
  const [acknowledgingFlag, setAcknowledgingFlag] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [scheduleActionError, setScheduleActionError] = useState<string | null>(null);
  const [pendingMous, setPendingMous] = useState<any[]>([]);
  const [signingMou, setSigningMou] = useState<string | null>(null);
  const [confirmationAction, setConfirmationAction] = useState<ConfirmationAction | null>(null);

  const supabase = createClient() as any;

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (!students.length) return;
    const studentId = new URLSearchParams(window.location.search).get('student');
    if (studentId && students.some((student) => student.id === studentId)) void loadMessages(studentId);
  }, [students]);

  const loadAll = async () => {
    const [
      { data: pending },
      { data: allStudents },
      { data: allSchedules },
      { data: quizFlagsData },
      { data: pendingSites },
      { data: pendingInstructors },
      { data: pendingClasses },
      { data: pendingMousData },
    ] = await Promise.all([
      supabase.from('students').select('*, training_classes(name, class_start_date, ride_time_end_date, training_sites(name), instructors(first_name, last_name))').eq('status', 'pending').not('onboarding_completed_at', 'is', null).order('created_at', { ascending: false }),
      supabase.from('students').select('*, training_classes(name, class_start_date, ride_time_end_date, training_sites(name), instructors(first_name, last_name))').order('created_at', { ascending: false }),
      supabase.from('schedules').select('*, students!inner(full_name, email, training_classes(name, class_start_date, ride_time_end_date))').order('created_at', { ascending: false }),
      supabase.from('quiz_flags').select('*').eq('acknowledged', false).order('created_at', { ascending: false }),
      supabase.from('training_sites').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('instructors').select('*, training_sites(name)').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('training_classes').select('*, training_sites(name), instructors(first_name, last_name)').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('class_mous').select('*, training_classes!inner(name, training_sites!inner(name), instructors!inner(first_name, last_name, email))').is('wfems_signed_at', null).not('representative_signature', 'eq', '').order('created_at', { ascending: false }),
    ]);

    setPendingStudents(pending ?? []);
    setStudents(allStudents ?? []);
    setSchedules(allSchedules ?? []);
    setQuizFlags(quizFlagsData ?? []);
    setRegistryItems([
      ...(pendingSites ?? []).map((item: any) => ({ ...item, registryTable: 'training_sites', registryLabel: 'Site' })),
      ...(pendingInstructors ?? []).map((item: any) => ({ ...item, registryTable: 'instructors', registryLabel: 'Instructor' })),
      ...(pendingClasses ?? []).map((item: any) => ({ ...item, registryTable: 'training_classes', registryLabel: 'Class' })),
    ]);
    setPendingMous(pendingMousData ?? []);
  };

  const handleApprove = async (student: any) => {
    setApproving(student.id);
    setApprovalError(null);
    try {
      const response = await fetch('/api/admin/approve-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id }),
      });

      let result: any = null;
      try {
        result = await response.json();
      } catch {}

      if (!response.ok || result?.success !== true) {
        const serverMessage = typeof result?.error === 'string' && result.error.trim()
          ? result.error
          : typeof result?.message === 'string' && result.message.trim()
            ? result.message
            : null;
        throw new Error(serverMessage ?? (response.ok
          ? 'Approval failed. The server did not confirm success.'
          : `Approval failed with status ${response.status}.`));
      }

      await loadAll();
      setApprovalError(null);
    } catch (e) {
      console.error('Approval failed:', e);
      setApprovalError(e instanceof Error ? e.message : 'Approval failed. Please try again.');
    } finally {
      setApproving(null);
    }
  };

  const handleScheduleAction = async (scheduleId: string, action: 'approved' | 'rejected' | 'cancelled' | 'approved_and_blocked' | 'rejected_and_blocked', note?: string) => {
    setScheduleActionError(null);
    try {
      const response = await fetch('/api/admin/schedule-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId, action, note: note || undefined }),
      });
      const data = await response.json();
      if (!response.ok || data?.success !== true) {
        throw new Error(data?.error || `Schedule action failed with status ${response.status}.`);
      }
      await loadAll();
    } catch (e) {
      setScheduleActionError(e instanceof Error ? e.message : 'Schedule action failed. Please try again.');
    }
  };

  const handleRegistryAction = async (item: any, status: 'active' | 'rejected') => {
    setRegistryActioning(item.id);
    try {
      const response = await fetch('/api/admin/registry-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: item.registryTable, id: item.id, status }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || data?.success !== true) {
        throw new Error(data?.error || 'Registry action failed.');
      }
      await loadAll();
    } catch (e) {
      setScheduleActionError(e instanceof Error ? e.message : 'Registry action failed. Please try again.');
    } finally {
      setRegistryActioning(null);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeStudentId) return;
    setScheduleActionError(null);
    const response = await fetch('/api/admin/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: activeStudentId, message: replyText.trim() }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.message) {
      setScheduleActionError(result?.error || 'Unable to send the reply.');
      return;
    }
    setReplyText('');
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('student_id', activeStudentId)
      .order('created_at', { ascending: true });
    setMessages(msgs ?? []);
  };

  const handleKillSwitch = async (student: any) => {
    const newState = !student.is_blacklisted;
    await supabase
      .from('students')
      .update({ is_blacklisted: newState })
      .eq('id', student.id);
    await loadAll();
  };

  const handleNoShow = async (student: any) => {
    const newCount = (student.no_show_count || 0) + 1;
    await supabase
      .from('students')
      .update({ no_show_count: newCount })
      .eq('id', student.id);
    await loadAll();
  };

  const handleDeleteStudent = async (student: any) => {
    setDeleting(student.id);
    setDeleteError(null);
    try {
      const res = await fetch('/api/admin/delete-student', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setDeleteError(data.error || `Deletion failed with status ${res.status}`);
      } else {
        await loadAll();
      }
    } catch (e: any) {
      setDeleteError(e?.message || 'Network error during deletion.');
    }
    setDeleting(null);
  };

  const handleConfirmAction = () => {
    if (!confirmationAction) return;

    if (confirmationAction.type === 'delete' && !confirmationAction.finalWarning) {
      setConfirmationAction({ ...confirmationAction, finalWarning: true });
      return;
    }

    setConfirmationAction(null);
    if (confirmationAction.type === 'blacklist') {
      void handleKillSwitch(confirmationAction.student);
    } else {
      void handleDeleteStudent(confirmationAction.student);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;
    setBroadcasting(true);
    const certifiedStudents = students.filter((s: any) => s.status === 'certified' && !s.is_blacklisted);
    if (certifiedStudents.length === 0) {
      alert('No certified students to broadcast to.');
      setBroadcasting(false);
      return;
    }
    const { data: broadcast } = await supabase.from('broadcasts').insert({
      title: broadcastTitle.trim(),
      body: broadcastBody.trim(),
      sent_by: 'admin',
    }).select('id').single();
    if (broadcast) {
      await supabase.from('messages').insert(
        certifiedStudents.map((s: any) => ({
          student_id: s.id,
          sender: 'admin' as const,
          message_text: broadcastTitle.trim() + '\n\n' + broadcastBody.trim(),
          broadcast_id: broadcast.id,
        }))
      );
      await supabase.from('broadcasts').update({ recipient_count: certifiedStudents.length }).eq('id', broadcast.id);
    }
    setBroadcastTitle(''); setBroadcastBody(''); setShowBroadcast(false); setBroadcasting(false);
    await loadAll();
  };

  const loadMessages = async (studentId: string) => {
    setActiveStudentId(studentId);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: true });
    setMessages(data ?? []);
  };

  const handleAcknowledgeFlag = async (flagId: string) => {
    setAcknowledgingFlag(flagId);
    try {
      await fetch('/api/admin/acknowledge-quiz-flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagId }),
      });
      setQuizFlags((prev) => prev.filter((f) => f.id !== flagId));
    } catch {}
    setAcknowledgingFlag(null);
  };

  const pendingSchedules = schedules.filter((s: any) => s.status === 'pending');
  const cancelRequests = schedules.filter((s: any) => s.status === 'cancelled' && s.cancelled_by === 'student');
  const rosterStudents = students.filter((s: any) => s.status === 'certified');
  const totalActions = pendingStudents.length + pendingSchedules.length + cancelRequests.length + quizFlags.length + registryItems.length + pendingMous.length;

  const handleWfemsSign = async (mouId: string) => {
    setSigningMou(mouId);
    try {
      const res = await fetch('/api/admin/sign-mou', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mouId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setScheduleActionError(err?.error || 'Failed to sign MOU.');
      }
    } catch {
      setScheduleActionError('Network error signing MOU.');
    }
    setSigningMou(null);
    loadAll();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Action Required */}
      <SectionCard className="p-4 lg:col-span-2">
        <h3 className="font-bold text-wfd-charcoal mb-3">
          Action Required
          {totalActions > 0 && (
            <span className="ml-2 text-xs bg-wfd-crimson text-white rounded-full px-2 py-0.5">
              {totalActions}
            </span>
          )}
        </h3>
        {approvalError && (
          <Alert tone="danger">Approval failed: {approvalError}</Alert>
        )}
        {deleteError && (
          <Alert tone="danger">Deletion failed: {deleteError}</Alert>
        )}
        {totalActions === 0 ? (
          <EmptyState title="Nothing requires your attention" />
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pendingStudents.map((s) => (
              <div key={`approval-${s.id}`} className="flex flex-col gap-2 rounded-lg bg-gray-50 p-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-wfd-sage/10 text-wfd-sage">Approval</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.full_name}</p>
                    <p className="text-xs text-gray-500">{getStudentClassLabel(s)}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleApprove(s)}
                  loading={approving === s.id}
                  className="ml-3 flex-shrink-0"
                >
                  Approve
                </Button>
              </div>
            ))}
            {registryItems.map((item) => {
              const site = Array.isArray(item.training_sites) ? item.training_sites[0] : item.training_sites;
              const title = item.registryTable === 'training_sites'
                ? item.name
                : item.registryTable === 'instructors'
                  ? `${item.first_name} ${item.last_name}`
                  : item.name;
              const detail = item.registryTable === 'training_classes'
                ? `${site?.name ?? 'Training site'} - ${item.class_start_date} to ${item.ride_time_end_date}`
                : item.registryTable === 'instructors'
                  ? `${site?.name ?? 'Training site'} - ${item.email}`
                  : `${item.organization_name} - ${item.city}, ${item.state}`;

              return (
                <div key={`registry-${item.registryTable}-${item.id}`} className="flex flex-col gap-2 rounded-lg bg-gray-50 p-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{item.registryLabel}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{title}</p>
                      <p className="text-xs text-gray-500 truncate">{detail}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:ml-3 sm:flex-shrink-0">
                    <Button size="sm" onClick={() => handleRegistryAction(item, 'active')} loading={registryActioning === item.id}>Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => handleRegistryAction(item, 'rejected')} loading={registryActioning === item.id}>Reject</Button>
                  </div>
                </div>
              );
            })}
            {scheduleActionError && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1">{scheduleActionError}</p>
            )}
            {pendingSchedules.map((s: any) => (
              <div key={`schedule-${s.id}`} className="flex flex-col gap-2 rounded-lg bg-gray-50 p-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Schedule</span>
                  <div>
                    <p className="text-sm font-medium">{s.students?.full_name}</p>
                    <p className="text-xs text-gray-500">
                      {s.date}
                      {s.start_time && s.end_time
                        ? ` — ${to24Hour(s.start_time)}–${to24Hour(s.end_time)}`
                        : ` — ${s.shift_type}`}
                    </p>
                    {(() => {
                      const rotation = getShiftRotation(s.date);
                      return (
                        <span className={`mt-1 inline-flex rounded border px-1.5 py-0.5 text-[10px] font-semibold ${ROTATION_TAG_STYLES[rotation.color]}`}>
                          {rotation.label} - {rotation.chief}
                        </span>
                      );
                    })()}
                    {s.students?.training_classes && (
                      <p className="text-xs text-gray-400">
                        Window: {s.students.training_classes.class_start_date} to {s.students.training_classes.ride_time_end_date}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" onClick={() => handleScheduleAction(s.id, 'approved')}>Approve</Button>
                  <Button size="sm" variant="secondary" onClick={() => handleScheduleAction(s.id, 'approved_and_blocked')}>Approve + Block</Button>
                  <Button variant="danger" size="sm" onClick={() => handleScheduleAction(s.id, 'rejected')}>Reject</Button>
                  <Button variant="danger" size="sm" onClick={() => handleScheduleAction(s.id, 'rejected_and_blocked')}>Reject + Block</Button>
                  <ScheduleCancelButton scheduleId={s.id} onCancel={handleScheduleAction} />
                </div>
              </div>
            ))}
            {cancelRequests.map((s: any) => (
              <div key={`cancel-${s.id}`} className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Cancel Req</span>
                  <div>
                    <p className="text-sm font-medium">{s.students?.full_name}</p>
                    <p className="text-xs text-gray-500">
                      {s.date}
                      {s.start_time && s.end_time
                        ? ` — ${to24Hour(s.start_time)}–${to24Hour(s.end_time)}`
                        : ` — ${s.shift_type}`}
                    </p>
                    {s.cancel_note && (
                      <p className="text-xs text-gray-400 italic mt-0.5">"{s.cancel_note}"</p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleScheduleAction(s.id, 'cancelled')}
                  className="ml-3 flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Cancel Shift
                </Button>
              </div>
            ))}
            {quizFlags.map((f) => (
              <div key={`flag-${f.id}`} className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Flag</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{f.student_name}</p>
                    <p className="text-xs text-gray-500">{f.rule_title} — {f.attempt_count} attempts — {new Date(f.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleAcknowledgeFlag(f.id)}
                  loading={acknowledgingFlag === f.id}
                  className="ml-3 flex-shrink-0"
                >
                  Acknowledge
                </Button>
              </div>
            ))}
            {pendingMous.map((mou) => {
              const trainingClass = Array.isArray(mou.training_classes) ? mou.training_classes[0] : mou.training_classes;
              const site = Array.isArray(trainingClass?.training_sites) ? trainingClass.training_sites[0] : trainingClass?.training_sites;
              const instructor = Array.isArray(trainingClass?.instructors) ? trainingClass.instructors[0] : trainingClass?.instructors;
              return (
                <div key={`mou-${mou.id}`} className="flex flex-col gap-2 rounded-lg bg-gray-50 p-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-wfd-charcoal/10 text-wfd-charcoal">MOU</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{trainingClass?.name ?? 'Class'}</p>
                      <p className="text-xs text-gray-500">
                        {site?.name ?? 'Site'} — {instructor ? `${instructor.first_name} ${instructor.last_name}` : 'Instructor'} — Signed {new Date(mou.representative_signed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleWfemsSign(mou.id)}
                    loading={signingMou === mou.id}
                    className="ml-3 flex-shrink-0"
                  >
                    Sign as WFEMS
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Threaded Messaging */}
      <SectionCard className="p-4 lg:col-span-2">
        <h3 className="font-bold text-wfd-charcoal mb-3">Student Messages</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 border-r border-gray-200 pr-2 max-h-64 overflow-y-auto">
            {students.map((s) => (
              <button
                key={s.id}
                onClick={() => loadMessages(s.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeStudentId === s.id
                    ? 'bg-wfd-crimson text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {s.full_name}
              </button>
            ))}
          </div>
          <div className="md:col-span-3">
            {activeStudentId ? (
              <div className="flex flex-col h-64">
                <div className="flex-1 overflow-y-auto space-y-2 mb-2">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`text-sm px-3 py-1.5 rounded-lg max-w-[80%] ${
                        m.sender === 'admin'
                          ? 'bg-wfd-charcoal text-white ml-auto'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {m.message_text}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    placeholder="Reply..."
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-wfd-charcoal outline-none text-gray-900"
                  />
                  <Button onClick={handleSendReply} disabled={!replyText.trim()}>
                    Send
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowBroadcast(true)}>
                    Broadcast
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm py-8 text-center">Select a student to view messages.</p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Student Roster with Actions */}
      <SectionCard className="p-4 lg:col-span-2">
        <h3 className="font-bold text-wfd-charcoal mb-3">Student Roster</h3>
        <DataTable>
            <DataTableHead><DataTableRow><DataTableCell header>Student</DataTableCell><DataTableCell header>Status</DataTableCell><DataTableCell header>No-Shows</DataTableCell><DataTableCell header>Actions</DataTableCell></DataTableRow></DataTableHead>
            <tbody>
              {rosterStudents.map((s) => {
                const expirationCountdown = getExpirationCountdown(s.access_until);
                const trainingClass = getStudentClass(s);
                const expirationTitle = trainingClass && expirationCountdown
                  ? `${expirationCountdown.title}; class ${trainingClass.name} ride-time ends ${trainingClass.ride_time_end_date}`
                  : expirationCountdown?.title;

                return (
                  <DataTableRow key={s.id}>
                    <DataTableCell>
                      <a href={`/admin/students/${s.id}`} className="font-medium text-wfd-crimson hover:underline">{s.full_name}</a>
                      <p className="text-xs text-gray-400">{s.email}</p>
                      {trainingClass && <p className="text-xs text-gray-400">{getStudentClassLabel(s)}</p>}
                    </DataTableCell>
                    <DataTableCell>
                      <Badge variant={s.status === 'certified' ? 'green' : s.status === 'pending' ? 'gold' : 'gray'}>
                        {s.status}
                      </Badge>
                      {expirationCountdown && (
                        <span title={expirationTitle}>
                          <Badge variant={expirationCountdown.variant} className="ml-1">
                            {expirationCountdown.label}
                          </Badge>
                        </span>
                      )}
                      {s.is_blacklisted && <Badge variant="red" className="ml-1">Blacklisted</Badge>}
                      {(s.no_show_count >= 3) && (
                        <Badge variant="red" className="ml-1">{s.no_show_count} no-shows</Badge>
                      )}
                    </DataTableCell>
                    <DataTableCell>
                      <Button variant="secondary" size="sm" onClick={() => handleNoShow(s)}>
                        +No-Show ({s.no_show_count || 0})
                      </Button>
                    </DataTableCell>
                    <DataTableCell>
                      <button
                        onClick={() => s.is_blacklisted
                          ? handleKillSwitch(s)
                          : setConfirmationAction({ type: 'blacklist', student: s })}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          s.is_blacklisted
                            ? 'bg-wfd-sage/15 text-wfd-sage hover:bg-wfd-sage/25'
                            : 'bg-wfd-crimson/15 text-wfd-crimson hover:bg-wfd-crimson/25'
                        }`}
                      >
                        {s.is_blacklisted ? 'Reactivate' : 'Blacklist'}
                      </button>
                      <button
                        onClick={() => setConfirmationAction({ type: 'delete', student: s, finalWarning: false })}
                        disabled={deleting === s.id}
                        className="px-3 py-1 rounded text-xs font-medium bg-wfd-crimson text-white hover:brightness-90 disabled:opacity-50 ml-1"
                      >
                        {deleting === s.id ? '...' : 'Delete'}
                      </button>
                    </DataTableCell>
                  </DataTableRow>
                );
              })}
            </tbody>
          </DataTable>
      </SectionCard>

      {/* Shift Management */}
      <ShiftManagement schedules={schedules} students={students} onCancel={handleScheduleAction} />

      {/* Broadcast Modal */}
      {showBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowBroadcast(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-wfd-charcoal mb-4">Send Broadcast to All Students</h3>
            <div className="space-y-3">
              <Input label="Title" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} />
              <label className="block text-sm font-medium text-gray-700">
                Message
                <textarea value={broadcastBody} onChange={(e) => setBroadcastBody(e.target.value)} className="mt-1 min-h-32 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson" />
              </label>
              <div className="flex gap-2">
                <Button type="button" onClick={handleSendBroadcast} loading={broadcasting}>
                  Send to {students.filter((s: any) => s.status === 'certified' && !s.is_blacklisted).length} students
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowBroadcast(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {confirmationAction && (
        <ConfirmDialog
          open
          title={confirmationAction.type === 'blacklist'
            ? `Blacklist ${confirmationAction.student.full_name}?`
            : confirmationAction.finalWarning
              ? `Permanently delete ${confirmationAction.student.full_name}?`
              : `Delete ${confirmationAction.student.full_name}?`}
          description={confirmationAction.type === 'blacklist'
            ? `This will prevent ${confirmationAction.student.full_name} from accessing the portal.`
            : confirmationAction.finalWarning
              ? `FINAL WARNING: All data for ${confirmationAction.student.full_name} will be permanently deleted. Proceed?`
              : `This will permanently remove ${confirmationAction.student.full_name} (${confirmationAction.student.email}), including their student record, schedules, evaluations, and messages. This cannot be undone.`}
          confirmLabel={confirmationAction.type === 'blacklist'
            ? 'Blacklist student'
            : confirmationAction.finalWarning
              ? 'Permanently delete'
              : 'Continue'}
          onConfirm={handleConfirmAction}
          onClose={() => setConfirmationAction(null)}
        />
      )}
    </div>
  );
}

function ScheduleCancelButton({ scheduleId, onCancel }: { scheduleId: string; onCancel: (scheduleId: string, action: 'cancelled', note?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    onCancel(scheduleId, 'cancelled', note.trim() || undefined);
    setNote('');
    setOpen(false);
  };

  if (!open) {
    return <button onClick={() => setOpen(true)} className="text-xs text-gray-400 hover:text-wfd-crimson shrink-0">Cancel</button>;
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (student will see)"
        className="w-32 rounded border border-gray-200 px-2 py-0.5 text-xs focus:border-wfd-crimson focus:ring-1 focus:ring-wfd-crimson"
      />
      <button onClick={handleConfirm} className="text-xs px-2 py-0.5 rounded bg-wfd-crimson text-white hover:brightness-90">Cancel</button>
      <button onClick={() => { setOpen(false); setNote(''); }} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
    </div>
  );
}
