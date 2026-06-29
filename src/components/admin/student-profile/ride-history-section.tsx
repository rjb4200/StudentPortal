'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface Schedule {
  id: string;
  date: string;
  shift_type: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  start_time: string | null;
  end_time: string | null;
  cancel_note: string | null;
  cancelled_by: string | null;
}

interface RideHistorySectionProps {
  schedules: Schedule[];
}

type FilterStatus = 'all' | 'approved' | 'cancelled' | 'rejected' | 'pending';

const statusBadgeVariant: Record<string, 'green' | 'orange' | 'gray' | 'gold'> = {
  approved: 'green',
  cancelled: 'orange',
  rejected: 'gray',
  pending: 'gold',
};

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function RideHistorySection({ schedules }: RideHistorySectionProps) {
  const [filter, setFilter] = useState<FilterStatus>('all');

  const filtered = filter === 'all'
    ? schedules
    : schedules.filter((s) => s.status === filter);

  const counts = {
    all: schedules.length,
    approved: schedules.filter((s) => s.status === 'approved').length,
    cancelled: schedules.filter((s) => s.status === 'cancelled').length,
    rejected: schedules.filter((s) => s.status === 'rejected').length,
    pending: schedules.filter((s) => s.status === 'pending').length,
  };

  if (schedules.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 print:border-none print:p-0">
        <h3 className="font-semibold text-wfd-charcoal mb-2">Ride History</h3>
        <p className="text-sm text-gray-400">No ride history available</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 print:border-none print:p-0">
      <h3 className="font-semibold text-wfd-charcoal mb-3">Ride History</h3>

      <div className="flex flex-wrap gap-2 mb-3 print:hidden">
        {(['all', 'approved', 'cancelled', 'rejected', 'pending'] as FilterStatus[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-wfd-crimson text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="py-2 px-3 font-medium text-gray-500">Date</th>
              <th className="py-2 px-3 font-medium text-gray-500">Type</th>
              <th className="py-2 px-3 font-medium text-gray-500">Time</th>
              <th className="py-2 px-3 font-medium text-gray-500">Status</th>
              <th className="py-2 px-3 font-medium text-gray-500 print:hidden">Cancel Reason</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-gray-100">
                <td className="py-2 px-3 text-wfd-charcoal">{formatDate(s.date)}</td>
                <td className="py-2 px-3 capitalize text-wfd-charcoal">{s.shift_type}</td>
                <td className="py-2 px-3 text-gray-500">
                  {s.start_time && s.end_time ? `${s.start_time} - ${s.end_time}` : '—'}
                </td>
                <td className="py-2 px-3">
                  <Badge variant={statusBadgeVariant[s.status] || 'gray'}>
                    {s.status}
                  </Badge>
                </td>
                <td className="py-2 px-3 text-xs text-gray-400 max-w-[200px] truncate print:hidden">
                  {s.status === 'cancelled' ? (
                    <>
                      {s.cancel_note && <span>{s.cancel_note}</span>}
                      {s.cancelled_by && <span className="ml-1">by {s.cancelled_by}</span>}
                      {!s.cancel_note && !s.cancelled_by && '—'}
                    </>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
