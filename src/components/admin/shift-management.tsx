'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { to24Hour } from '@/lib/time-formats';

type Tab = 'approved' | 'cancelled' | 'rejected' | 'all';

interface ShiftManagementProps {
  schedules: any[];
  students: any[];
  onCancel: (scheduleId: string, action: 'cancelled', note?: string) => void;
}

export function ShiftManagement({ schedules, students, onCancel }: ShiftManagementProps) {
  const [activeTab, setActiveTab] = useState<Tab>('approved');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const filtered = useMemo(() => {
    return schedules.filter((s: any) => {
      if (activeTab !== 'all' && s.status !== activeTab) return false;
      if (dateFrom && s.date < dateFrom) return false;
      if (dateTo && s.date > dateTo) return false;
      if (selectedStudentId && s.student_id !== selectedStudentId) return false;
      return true;
    });
  }, [schedules, activeTab, dateFrom, dateTo, selectedStudentId]);

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { approved: 0, cancelled: 0, rejected: 0, all: 0 };
    for (const s of schedules) {
      c.all++;
      if (s.status === 'approved') c.approved++;
      else if (s.status === 'cancelled') c.cancelled++;
      else if (s.status === 'rejected') c.rejected++;
    }
    return c;
  }, [schedules]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'approved', label: `Approved (${counts.approved})` },
    { key: 'cancelled', label: `Cancelled (${counts.cancelled})` },
    { key: 'rejected', label: `Rejected (${counts.rejected})` },
    { key: 'all', label: `All (${counts.all})` },
  ];

  const statusBadge = (status: string, cancelledBy?: string | null) => {
    if (status === 'approved') return <Badge variant="crimson">Approved</Badge>;
    if (status === 'cancelled') return (
      <div className="flex flex-col gap-0.5">
        <Badge variant="orange">Cancelled</Badge>
        {cancelledBy && (
          <span className="text-[10px] text-gray-400">by {cancelledBy}</span>
        )}
      </div>
    );
    if (status === 'rejected') return <Badge variant="gray">Rejected</Badge>;
    return null;
  };

  const timeDisplay = (s: any) => {
    if (s.start_time && s.end_time) {
      return `${to24Hour(s.start_time)}–${to24Hour(s.end_time)}`;
    }
    return s.shift_type;
  };

  return (
    <Card className="p-4 lg:col-span-2">
      <h3 className="font-bold text-wfd-charcoal mb-3">Shift Management</h3>

      <div className="flex gap-1 mb-3 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-wfd-crimson text-wfd-crimson'
                : 'border-transparent text-gray-500 hover:text-wfd-charcoal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-3">
        <div className="flex items-center gap-1">
          <label className="text-xs text-gray-500">From:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded border border-gray-200 px-2 py-1 text-xs focus:border-wfd-crimson focus:ring-1 focus:ring-wfd-crimson text-gray-900"
          />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-xs text-gray-500">To:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded border border-gray-200 px-2 py-1 text-xs focus:border-wfd-crimson focus:ring-1 focus:ring-wfd-crimson text-gray-900"
          />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-xs text-gray-500">Student:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="rounded border border-gray-200 px-2 py-1 text-xs focus:border-wfd-crimson focus:ring-1 focus:ring-wfd-crimson text-gray-900"
          >
            <option value="">All Students</option>
            {students.map((s: any) => (
              <option key={s.id} value={s.id}>{s.full_name}</option>
            ))}
          </select>
        </div>
        {(dateFrom || dateTo || selectedStudentId) && (
          <button
            onClick={() => { setDateFrom(''); setDateTo(''); setSelectedStudentId(''); }}
            className="text-xs text-wfd-crimson hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="py-2 px-3 font-medium text-gray-500">Date</th>
              <th className="py-2 px-3 font-medium text-gray-500">Student</th>
              <th className="py-2 px-3 font-medium text-gray-500">Type</th>
              <th className="py-2 px-3 font-medium text-gray-500">Time</th>
              <th className="py-2 px-3 font-medium text-gray-500">Status</th>
              <th className="py-2 px-3 font-medium text-gray-500 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400 text-sm">
                  No shifts found.
                </td>
              </tr>
            ) : (
              filtered.map((s: any) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 whitespace-nowrap">
                    {new Date(s.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
                  </td>
                  <td className="py-2 px-3 font-medium">{s.students?.full_name}</td>
                  <td className="py-2 px-3 capitalize">{s.shift_type}</td>
                  <td className="py-2 px-3 whitespace-nowrap">{timeDisplay(s)}</td>
                  <td className="py-2 px-3">{statusBadge(s.status, s.cancelled_by)}</td>
                  <td className="py-2 px-3">
                    {s.status === 'approved' && (
                      <ScheduleCancelButton
                        scheduleId={s.id}
                        onCancel={onCancel}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
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
      <button onClick={() => { setOpen(false); setNote(''); }} className="text-xs text-gray-400 hover:text-gray-600">&#10005;</button>
    </div>
  );
}
