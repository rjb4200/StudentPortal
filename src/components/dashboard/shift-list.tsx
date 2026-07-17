'use client';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui';
import { abbreviated12 } from '@/lib/time-formats';

interface Schedule {
  id: string;
  date: string;
  shift_type: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  start_time?: string | null;
  end_time?: string | null;
}

interface ShiftListProps {
  schedules: Schedule[];
  onDateClick: (date: string) => void;
  onCancel: (schedule: Schedule) => void;
}

const STATUS_CONFIG: Record<string, { icon: string; label: string; className: string }> = {
  pending: { icon: '\u231B', label: 'Pending', className: 'bg-wfd-gold/15 text-wfd-gold' },
  approved: { icon: '\u2713', label: 'Approved', className: 'bg-wfd-sage/15 text-wfd-sage' },
  cancelled: { icon: '\u2014', label: 'Cancelled', className: 'bg-amber-100 text-amber-800' },
  rejected: { icon: '\u2715', label: 'Rejected', className: 'bg-gray-100 text-gray-500' },
};

export function ShiftList({ schedules, onDateClick, onCancel }: ShiftListProps) {
  const sorted = [...schedules].sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) {
    return (
      <EmptyState
        title="No shifts scheduled yet"
        description="Click a date on the calendar or use the Request Shift button to get started."
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left">
              <th className="py-3 px-4 font-medium text-gray-500">Date</th>
              <th className="py-3 px-4 font-medium text-gray-500">Type</th>
              <th className="py-3 px-4 font-medium text-gray-500">Time</th>
              <th className="py-3 px-4 font-medium text-gray-500">Status</th>
              <th className="py-3 px-4 font-medium text-gray-500 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => {
              const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.pending;
              const isTerminal = s.status === 'cancelled' || s.status === 'rejected';
              const timeDisplay = s.start_time && s.end_time
                ? `${abbreviated12(s.start_time)} \u2013 ${abbreviated12(s.end_time)}`
                : s.shift_type;

              return (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2.5 px-4">
                    <button onClick={() => onDateClick(s.date)} className="text-wfd-crimson hover:underline font-medium text-left">
                      {new Date(s.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </button>
                  </td>
                  <td className="py-2.5 px-4 capitalize">{s.shift_type}</td>
                  <td className="py-2.5 px-4 whitespace-nowrap">{timeDisplay}</td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
                      <span>{cfg.icon}</span>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    {!isTerminal && (
                      <button onClick={() => onCancel(s)} className="text-xs text-gray-400 hover:text-wfd-crimson">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
