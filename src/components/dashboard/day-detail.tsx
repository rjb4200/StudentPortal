'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { abbreviated12 } from '@/lib/time-formats';

interface Schedule {
  id: string;
  date: string;
  shift_type: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  start_time?: string | null;
  end_time?: string | null;
}

interface DayDetailModalProps {
  open: boolean;
  onClose: () => void;
  onCancel: () => void;
  schedule: Schedule | null;
}

const STATUS_CONFIG: Record<string, { icon: string; label: string; className: string }> = {
  pending: { icon: '\u231B', label: 'Pending Approval', className: 'bg-wfd-gold/15 text-wfd-gold border-wfd-gold/30' },
  approved: { icon: '\u2713', label: 'Approved', className: 'bg-wfd-sage/15 text-wfd-sage border-wfd-sage/30' },
  cancelled: { icon: '\u2014', label: 'Cancelled', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  rejected: { icon: '\u2715', label: 'Rejected', className: 'bg-gray-100 text-gray-500 border-gray-200' },
};

export function DayDetailModal({ open, onClose, onCancel, schedule }: DayDetailModalProps) {
  if (!schedule) return null;

  const isTerminal = schedule.status === 'cancelled' || schedule.status === 'rejected';
  const statusCfg = STATUS_CONFIG[schedule.status] || STATUS_CONFIG.pending;
  const timeDisplay = schedule.start_time && schedule.end_time
    ? `${abbreviated12(schedule.start_time)} \u2013 ${abbreviated12(schedule.end_time)}`
    : schedule.shift_type;

  const dateDisplay = new Date(schedule.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Modal open={open} onClose={onClose} title="Shift Details">
      <div className="space-y-4 mb-6">
        <p className="text-sm font-medium text-wfd-charcoal">{dateDisplay}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-0.5">Shift Type</p>
            <p className="text-sm font-medium text-wfd-charcoal capitalize">{schedule.shift_type}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-0.5">Time</p>
            <p className="text-sm font-medium text-wfd-charcoal">{timeDisplay}</p>
          </div>
        </div>

        <div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusCfg.className}`}>
            <span>{statusCfg.icon}</span>
            {statusCfg.label}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        {isTerminal ? (
          <Button variant="secondary" onClick={onClose} className="flex-1">Close</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose} className="flex-1">Close</Button>
            <Button variant="danger" onClick={onCancel} className="flex-1">Cancel Shift</Button>
          </>
        )}
      </div>
    </Modal>
  );
}
