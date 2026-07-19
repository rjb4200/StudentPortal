'use client';

import { useEffect, useState } from 'react';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { Alert, Button, Card, EmptyState, LoadingState } from '@/components/ui';
import { getScheduleBlockRangeSummary } from '@/lib/schedule-blocks';
import { to24Hour } from '@/lib/time-formats';

type ScheduleStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

type Schedule = {
  id: string;
  date: string;
  shift_type: string;
  status: ScheduleStatus;
  start_time: string | null;
  end_time: string | null;
  students: { full_name: string; email: string } | null;
};

type ScheduleBlock = { date: string; reason: string | null };

const statusStyles: Record<ScheduleStatus, string> = {
  pending: 'bg-wfd-gold/15 text-wfd-gold border-wfd-gold/30',
  approved: 'bg-wfd-crimson/10 text-wfd-crimson border-wfd-crimson/30',
  rejected: 'bg-gray-100 text-gray-500 border-gray-200',
  cancelled: 'bg-amber-100 text-amber-800 border-amber-200',
};

export function ScheduleCalendar() {
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [reason, setReason] = useState('');
  const [periodReason, setPeriodReason] = useState('');
  const [rangeStart, setRangeStart] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [rangeEnd, setRangeEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCalendar = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/schedule-calendar');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load the scheduling calendar.');
      setSchedules(data.schedules ?? []);
      setBlocks(data.blocks ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load the scheduling calendar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadCalendar(); }, []);

  const selectedBlock = blocks.find((block) => block.date === selectedDate);
  const selectedSchedules = schedules.filter((schedule) => schedule.date === selectedDate);
  const selectedPending = selectedSchedules.filter((schedule) => schedule.status === 'pending');
  const rangeSummary = getScheduleBlockRangeSummary(rangeStart, rangeEnd, blocks, schedules);
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  });

  useEffect(() => {
    setReason(selectedBlock?.reason ?? '');
  }, [selectedBlock?.date, selectedBlock?.reason]);

  const saveBlock = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/schedule-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, reason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save the blocked date.');
      await loadCalendar();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save the blocked date.');
    } finally {
      setSaving(false);
    }
  };

  const removeBlock = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/schedule-blocks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to remove the blocked date.');
      await loadCalendar();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to remove the blocked date.');
    } finally {
      setSaving(false);
    }
  };

  const saveRange = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/schedule-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: rangeStart, endDate: rangeEnd, reason: periodReason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save the blocked period.');
      await loadCalendar();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save the blocked period.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading scheduling calendar..." />;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Button variant="secondary" size="sm" onClick={() => setMonth((value) => subMonths(value, 1))}>Prev</Button>
          <h2 className="text-lg font-black text-wfd-charcoal">{format(month, 'MMMM yyyy')}</h2>
          <Button variant="secondary" size="sm" onClick={() => setMonth((value) => addMonths(value, 1))}>Next</Button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-2 text-center text-xs font-bold text-gray-400">{day}</div>
          ))}
          {days.map((day) => {
            const date = format(day, 'yyyy-MM-dd');
            const daySchedules = schedules.filter((schedule) => schedule.date === date);
            const block = blocks.find((item) => item.date === date);
            const counts = daySchedules.reduce<Record<ScheduleStatus, number>>((total, schedule) => {
              total[schedule.status]++;
              return total;
            }, { pending: 0, approved: 0, rejected: 0, cancelled: 0 });
            const isSelected = date === selectedDate;
            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={`min-h-24 rounded-lg border p-2 text-left transition-colors ${!isSameMonth(day, month) ? 'opacity-40' : ''} ${block ? 'border-gray-400 bg-gray-100' : 'border-gray-200 bg-white hover:border-wfd-crimson/40'} ${isSelected ? 'ring-2 ring-wfd-crimson ring-offset-1' : ''}`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-sm font-bold text-wfd-charcoal">{format(day, 'd')}</span>
                  {block && <span className="rounded bg-gray-700 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">Blocked</span>}
                </div>
                <div className="mt-2 space-y-0.5 text-[10px] font-semibold">
                  {counts.pending > 0 && <p className={block ? 'text-wfd-crimson' : 'text-wfd-gold'}>Pending: {counts.pending}{block ? ' !' : ''}</p>}
                  {counts.approved > 0 && <p className="text-wfd-crimson">Approved: {counts.approved}</p>}
                  {counts.rejected > 0 && <p className="text-gray-500">Rejected: {counts.rejected}</p>}
                  {counts.cancelled > 0 && <p className="text-amber-700">Cancelled: {counts.cancelled}</p>}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Selected date</p>
        <h2 className="mt-1 text-xl font-black text-wfd-charcoal">{new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h2>
        {error && <div className="mt-3"><Alert tone="danger">{error}</Alert></div>}
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-sm font-bold text-wfd-charcoal">{selectedBlock ? 'Day is blocked' : 'Day is open'}</p>
          <p className="mt-1 text-xs leading-5 text-gray-500">Blocking prevents new requests. Existing schedules remain unchanged.</p>
          <label className="mt-3 block text-xs font-bold text-gray-600">
            Student-visible reason (optional)
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} className="mt-1 min-h-20 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900" />
          </label>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={saveBlock} loading={saving}>{selectedBlock ? 'Update block' : 'Block day'}</Button>
            {selectedBlock && <Button size="sm" variant="secondary" onClick={removeBlock} loading={saving}>Remove block</Button>}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-sm font-bold text-wfd-charcoal">Block scheduling period</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="text-xs font-bold text-gray-600">Start<input type="date" value={rangeStart} onChange={(event) => setRangeStart(event.target.value)} className="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900" /></label>
            <label className="text-xs font-bold text-gray-600">End<input type="date" value={rangeEnd} onChange={(event) => setRangeEnd(event.target.value)} className="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900" /></label>
          </div>
          <label className="mt-3 block text-xs font-bold text-gray-600">
            Student-visible reason (optional)
            <textarea value={periodReason} onChange={(event) => setPeriodReason(event.target.value)} maxLength={500} className="mt-1 min-h-20 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900" />
          </label>
          {rangeSummary && rangeSummary.totalDays <= 31 && <p className="mt-3 text-xs leading-5 text-gray-600">{rangeSummary.totalDays} days: {rangeSummary.alreadyBlocked} already blocked, {rangeSummary.pendingSchedules} pending schedules, {rangeSummary.approvedSchedules} approved schedules. Existing schedules remain unchanged.</p>}
          {rangeEnd < rangeStart && <p className="mt-3 text-xs font-semibold text-wfd-crimson">End date must be on or after the start date.</p>}
          {rangeSummary && rangeSummary.totalDays > 31 && <p className="mt-3 text-xs font-semibold text-wfd-crimson">Schedule block ranges cannot exceed 31 days.</p>}
          <Button className="mt-3" size="sm" onClick={saveRange} loading={saving} disabled={!rangeSummary || rangeSummary.totalDays > 31}>Block period</Button>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-wfd-charcoal">Schedules ({selectedSchedules.length})</h3>
            {selectedBlock && selectedPending.length > 0 && <span className="rounded bg-wfd-gold/20 px-2 py-1 text-xs font-bold text-wfd-crimson">{selectedPending.length} pending on blocked day</span>}
          </div>
          <div className="mt-2 space-y-2">
            {selectedSchedules.length === 0 ? <EmptyState title="No schedules for this date" /> : selectedSchedules.map((schedule) => (
              <div key={schedule.id} className={`rounded-lg border p-2 ${schedule.status === 'pending' && selectedBlock ? 'border-wfd-gold bg-wfd-gold/10' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-wfd-charcoal">{schedule.students?.full_name ?? 'Student'}</p>
                    <p className="text-xs text-gray-500">{schedule.start_time && schedule.end_time ? `${to24Hour(schedule.start_time)}-${to24Hour(schedule.end_time)}` : schedule.shift_type}</p>
                  </div>
                  <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold capitalize ${statusStyles[schedule.status]}`}>{schedule.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
