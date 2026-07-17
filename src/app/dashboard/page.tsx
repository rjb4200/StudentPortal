'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CalendarGrid } from '@/components/dashboard/calendar-grid';
import { ShiftList } from '@/components/dashboard/shift-list';
import { DayDetailModal } from '@/components/dashboard/day-detail';
import { ShiftModal } from '@/components/dashboard/shift-modal';
import { CancelShiftModal } from '@/components/dashboard/cancel-shift-modal';
import { ResourceLibrary } from '@/components/onboarding/resource-library';
import { Messages } from '@/components/dashboard/messages';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, EmptyState, LoadingState } from '@/components/ui';

type DashboardSection = 'schedule' | 'resources' | 'messages' | 'feed';

interface Schedule {
  id: string;
  date: string;
  shift_type: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  start_time?: string | null;
  end_time?: string | null;
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShiftTime(schedule?: Schedule | null) {
  if (!schedule) return 'No shift scheduled';
  if (schedule.start_time && schedule.end_time) {
    return `${schedule.start_time} - ${schedule.end_time}`;
  }
  return schedule.shift_type === 'custom'
    ? 'Custom shift'
    : `${schedule.shift_type.charAt(0).toUpperCase()}${schedule.shift_type.slice(1)} shift`;
}

export default function DashboardPage() {
  const [student, setStudent] = useState<any>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Schedule | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [activeSection, setActiveSection] = useState<DashboardSection>('schedule');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [detailTarget, setDetailTarget] = useState<Schedule | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [welcomeMsg, setWelcomeMsg] = useState<{ title: string; body: string } | null>(null);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const supabase = createClient() as any;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: student } = await supabase
      .from('students')
      .select('*, training_classes(class_start_date, ride_time_end_date, name)')
      .eq('auth_user_id', user.id)
      .single();

    if (student) {
      setStudent(student);

      const [{ data: schedules }, { data: welcome }, { count }] = await Promise.all([
        supabase.from('schedules').select('*').eq('student_id', student.id).order('date', { ascending: true }),
        supabase.from('message_templates').select('title, body').eq('template_type', 'welcome').eq('is_active', true).limit(1),
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('student_id', student.id),
      ]);

      setSchedules((schedules ?? []) as Schedule[]);
      setMessageCount(count ?? 0);
      if (welcome?.[0]) setWelcomeMsg(welcome[0]);
      if (student.status === 'pending') setActiveSection('messages');
    }
    setLoading(false);
  };

  const isPending = student?.status === 'pending';
  const isCertified = student?.status === 'certified';
  const today = new Date().toISOString().split('T')[0];
  const trainingClass = Array.isArray(student?.training_classes) ? student.training_classes[0] : student?.training_classes;
  const classStartDate = trainingClass?.class_start_date ?? null;
  const rideTimeEndDate = trainingClass?.ride_time_end_date ?? null;
  const isDateInClassWindow = (date: string) => {
    if (!classStartDate || !rideTimeEndDate) return true;
    return date >= classStartDate && date <= rideTimeEndDate;
  };
  const activeSchedules = schedules.filter((s) => s.status !== 'cancelled' && s.status !== 'rejected');
  const pendingSchedules = schedules.filter((s) => s.status === 'pending');
  const futureApproved = schedules
    .filter((s) => s.status === 'approved' && s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextShift = futureApproved[0] ?? null;

  const openScheduleRequest = () => {
    const initialDate = isDateInClassWindow(today) ? today : classStartDate;
    if (!initialDate || !isDateInClassWindow(initialDate)) {
      setScheduleError('Scheduling is unavailable because your class ride-time window is not active.');
      return;
    }
    setScheduleError(null);
    setActiveSection('schedule');
    setSelectedDate(initialDate);
    setShowShiftModal(true);
  };

  const showScheduleSection = () => {
    setActiveSection('schedule');
  };

  const showMessagesSection = () => {
    setActiveSection('messages');
  };

  const showFeedSection = () => {
    setActiveSection('feed');
  };

  const viewNextShift = () => {
    if (!nextShift) return;
    setActiveSection('schedule');
    setDetailTarget(nextShift);
    setShowDetailModal(true);
  };

  const commandState = (() => {
    if (isPending) {
      return {
        eyebrow: 'Account Review',
        title: 'Account Pending Approval',
        body: 'Your onboarding is complete and is waiting for administrator review. Scheduling unlocks after approval.',
        badge: <Badge variant="gold">Pending Approval</Badge>,
        primaryLabel: 'Message Training Staff',
        onPrimary: showMessagesSection,
        secondaryLabel: 'Copy Calendar Feed',
        onSecondary: showFeedSection,
      };
    }
    if (pendingSchedules.length > 0) {
      return {
        eyebrow: 'Awaiting Approval',
        title: `${pendingSchedules.length} shift request${pendingSchedules.length === 1 ? '' : 's'} pending`,
        body: 'Your request is in the approval queue. You can review pending dates or schedule another shift.',
        badge: <Badge variant="orange">Pending Requests</Badge>,
        primaryLabel: 'View Pending Requests',
        onPrimary: showScheduleSection,
        secondaryLabel: 'Schedule Another Shift',
        onSecondary: openScheduleRequest,
      };
    }
    if (nextShift) {
      return {
        eyebrow: 'Next Shift Scheduled',
        title: `${formatDate(nextShift.date)} is your next approved shift`,
        body: `${formatShiftTime(nextShift)}. Review the details before reporting for your clinical rotation.`,
        badge: <Badge variant="green">Certified</Badge>,
        primaryLabel: 'View Shift Details',
        onPrimary: viewNextShift,
        secondaryLabel: 'Schedule Another Shift',
        onSecondary: openScheduleRequest,
      };
    }
    return {
      eyebrow: 'Ready for Rotations',
      title: 'Schedule your first shift',
      body: 'You are approved for clinical rotations. Start by scheduling a shift date and time.',
      badge: <Badge variant="green">Certified</Badge>,
      primaryLabel: 'Schedule a Shift',
      onPrimary: openScheduleRequest,
      secondaryLabel: 'View Schedule',
      onSecondary: showScheduleSection,
    };
  })();

  const handleDateClick = (date: string) => {
    if (!isCertified) return;
    const existing = schedules.find((s) => s.date === date);
    if (existing) {
      setDetailTarget(existing);
      setShowDetailModal(true);
      return;
    }
    if (date < today) return;
    if (!isDateInClassWindow(date)) {
      setScheduleError('That date is outside your class ride-time window.');
      return;
    }
    setScheduleError(null);
    setSelectedDate(date);
    setShowShiftModal(true);
  };

  const handleDetailCancel = () => {
    if (!detailTarget) return;
    setShowDetailModal(false);
    setCancelTarget(detailTarget);
    setShowCancelModal(true);
  };

  const handleShiftSubmit = async (shiftType: 'full' | 'day' | 'custom', startTime: string, endTime: string) => {
    if (!selectedDate || !student || !isCertified) return;

    setScheduleError(null);
    const response = await fetch('/api/schedule/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: selectedDate, shiftType, startTime, endTime }),
    });
    const result = await response.json().catch(() => null);

    if (!response.ok || result?.success !== true) {
      setScheduleError(result?.error || 'Unable to submit schedule request.');
      return;
    }

    setSchedules((prev) => [...prev, result.schedule as Schedule]);
    setShowShiftModal(false);
    setSelectedDate(null);
  };

  const handleCancelShift = async (note: string) => {
    if (!cancelTarget) return;
    await fetch('/api/schedule/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduleId: cancelTarget.id, note: note || undefined }),
    });
    if (cancelTarget.status === 'pending') {
      setSchedules((prev) => prev.filter((s) => s.id !== cancelTarget.id));
    } else {
      setSchedules((prev) => prev.map((s) => s.id === cancelTarget.id ? { ...s, status: 'cancelled' } : s));
    }
    setShowCancelModal(false);
    setCancelTarget(null);
  };

  const copyCalendarFeed = () => {
    if (!student?.id) return;
    navigator.clipboard.writeText(`${window.location.origin}/api/calendar/${student.id}.ics`);
  };

  const sections: { key: DashboardSection; label: string; description: string; locked?: boolean }[] = [
    { key: 'schedule', label: 'Schedule', description: 'Request and manage shifts', locked: isPending },
    { key: 'resources', label: 'Resources', description: 'Study and reference materials' },
    { key: 'messages', label: 'Messages', description: 'Contact training staff' },
    { key: 'feed', label: 'Calendar Feed', description: 'Copy your subscription link' },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] pt-20">
        <LoadingState label="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-2xl border border-wfd-charcoal/15 bg-white shadow-lg">
        <div className="border-b-4 border-wfd-sage bg-wfd-crimson px-5 py-5 text-white sm:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/80">{commandState.eyebrow}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black leading-tight sm:text-4xl">{commandState.title}</h1>
                {commandState.badge}
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/90 sm:text-base">{commandState.body}</p>
              <p className="mt-2 text-sm text-white/75">{student?.full_name} • {student?.school_name}</p>
              {classStartDate && rideTimeEndDate && (
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                  Class window: {formatDate(classStartDate)} to {formatDate(rideTimeEndDate)}
                </p>
              )}
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-56">
              <button
                onClick={commandState.onPrimary}
                className="w-full rounded-lg bg-white px-5 py-3 text-base font-semibold text-wfd-crimson transition-all hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {commandState.primaryLabel}
              </button>
              <button
                onClick={commandState.onSecondary}
                className="rounded-lg border border-white/35 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                {commandState.secondaryLabel}
              </button>
            </div>
          </div>
        </div>
        <div className="grid gap-4 bg-wfd-charcoal px-5 py-4 text-white sm:grid-cols-2 lg:grid-cols-4 lg:px-7">
          <SummaryCard
            label="Account Status"
            value={isPending ? 'Pending Review' : 'Certified'}
            detail={isPending ? 'Scheduling unlocks after approval' : 'Approved for clinical rotations'}
          />
          <SummaryCard
            label="Next Shift"
            value={nextShift ? formatDate(nextShift.date) : 'Not Scheduled'}
            detail={nextShift ? formatShiftTime(nextShift) : isCertified ? 'Schedule a shift to get started' : 'Available after approval'}
          />
          <SummaryCard
            label="Pending Requests"
            value={String(pendingSchedules.length)}
            detail={pendingSchedules.length === 1 ? '1 shift awaiting review' : `${pendingSchedules.length} shifts awaiting review`}
          />
          <SummaryCard
            label="Messages"
            value={String(messageCount)}
            detail={messageCount === 1 ? '1 message in your thread' : `${messageCount} messages in your thread`}
          />
        </div>
      </section>

      {welcomeMsg && !welcomeDismissed && !isPending && (
        <Card className="border-wfd-sage/30 bg-wfd-sage/10 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-wfd-sage">{welcomeMsg.title}</h3>
              <p className="mt-1 text-sm text-wfd-charcoal/70 whitespace-pre-line">{welcomeMsg.body}</p>
            </div>
            <button
              onClick={() => setWelcomeDismissed(true)}
              className="shrink-0 text-lg leading-none text-wfd-sage/60 hover:text-wfd-sage"
              aria-label="Dismiss welcome message"
            >
              ×
            </button>
          </div>
        </Card>
      )}

      {isPending && (
        <Card className="border-wfd-gold/40 bg-wfd-gold/10 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-black text-wfd-charcoal">Your account is in review</h2>
              <p className="mt-1 text-sm leading-6 text-wfd-charcoal/70">
                You can message training staff or copy your calendar feed now. Shift scheduling, preceptor profiles, and evaluations unlock after approval.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={showMessagesSection} variant="secondary">Message Staff</Button>
              <Button onClick={showFeedSection} variant="sage">Calendar Feed</Button>
            </div>
          </div>
        </Card>
      )}

      <nav className="grid gap-3 md:grid-cols-4" aria-label="Dashboard sections">
        {sections.map((section) => (
          <button
            key={section.key}
            onClick={() => !section.locked && setActiveSection(section.key)}
            disabled={section.locked}
            className={`rounded-xl border p-4 text-left transition-all ${
              activeSection === section.key
                ? 'border-wfd-crimson bg-wfd-crimson text-white shadow-md'
                : 'border-gray-200 bg-white text-wfd-charcoal hover:-translate-y-0.5 hover:border-wfd-crimson/40 hover:shadow'
            } ${section.locked ? 'cursor-not-allowed opacity-55 hover:translate-y-0 hover:border-gray-200 hover:shadow-none' : ''}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-black">{section.label}</span>
              {section.locked && <span className="text-xs font-bold uppercase">Locked</span>}
            </div>
            <p className={`mt-1 text-xs ${activeSection === section.key ? 'text-white/80' : 'text-gray-500'}`}>{section.description}</p>
          </button>
        ))}
      </nav>

      {activeSection === 'schedule' && !isPending && (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-wfd-charcoal">Schedule Your Clinical Shifts</h2>
              <p className="text-sm text-gray-500">
                Use the main button or click a future date on the calendar{classStartDate && rideTimeEndDate ? ` between ${formatDate(classStartDate)} and ${formatDate(rideTimeEndDate)}.` : '.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${viewMode === 'grid' ? 'bg-wfd-charcoal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${viewMode === 'list' ? 'bg-wfd-charcoal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                List
              </button>
            </div>
          </div>

          {scheduleError && (
            <Alert tone="danger">{scheduleError}</Alert>
          )}

          {activeSchedules.length === 0 && (
            <EmptyState
              title="No shifts scheduled yet"
              description="Start with the Schedule a Shift button. You can also pick a future date directly on the calendar."
              action={<Button onClick={openScheduleRequest}>Schedule a Shift</Button>}
            />
          )}

          {viewMode === 'grid' ? (
            <CalendarGrid schedules={schedules} onDateClick={handleDateClick} classStartDate={classStartDate} rideTimeEndDate={rideTimeEndDate} />
          ) : (
            <ShiftList
              schedules={schedules}
              onDateClick={handleDateClick}
              onCancel={(s) => {
                if (s.status === 'approved') {
                  setDetailTarget(s);
                  setShowDetailModal(true);
                } else {
                  setCancelTarget(s);
                  setShowCancelModal(true);
                }
              }}
            />
          )}
        </section>
      )}

      {activeSection === 'resources' && <ResourceLibrary />}

      {activeSection === 'messages' && <Messages studentId={student?.id} />}

      {activeSection === 'feed' && (
        <CalendarFeedCard studentId={student?.id} onCopy={copyCalendarFeed} />
      )}

      <DayDetailModal
        open={showDetailModal}
        onClose={() => { setShowDetailModal(false); setDetailTarget(null); }}
        onCancel={handleDetailCancel}
        schedule={detailTarget}
      />

      <ShiftModal
        open={showShiftModal}
        onClose={() => {
          setShowShiftModal(false);
          setSelectedDate(null);
        }}
        date={selectedDate}
        schedules={schedules}
        classStartDate={classStartDate}
        rideTimeEndDate={rideTimeEndDate}
        onDateChange={setSelectedDate}
        onSubmit={handleShiftSubmit}
      />

      {cancelTarget && (
        <CancelShiftModal
          open={showCancelModal}
          onClose={() => { setShowCancelModal(false); setCancelTarget(null); }}
          date={cancelTarget.date}
          shiftType={cancelTarget.shift_type}
          startTime={cancelTarget.start_time}
          endTime={cancelTarget.end_time}
          status={cancelTarget.status}
          onConfirm={handleCancelShift}
        />
      )}
    </div>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-white/60">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-white/70">{detail}</p>
    </div>
  );
}

function CalendarFeedCard({ studentId, onCopy }: { studentId: string; onCopy: () => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b-4 border-wfd-sage bg-wfd-charcoal p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Calendar Subscription</p>
        <h2 className="mt-1 text-2xl font-black">Keep your shifts on your phone calendar</h2>
        <p className="mt-2 text-sm text-white/75">Copy this feed into Google Calendar, Apple Calendar, or Outlook to see pending and approved shifts.</p>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center">
          <code className="min-w-0 flex-1 truncate text-xs text-gray-700">/api/calendar/{studentId}.ics</code>
          <Button onClick={onCopy} size="sm">Copy Link</Button>
        </div>
        <p className="text-sm text-gray-500">Calendar apps refresh subscriptions on their own schedule, so newly approved shifts may not appear immediately.</p>
      </div>
    </Card>
  );
}
