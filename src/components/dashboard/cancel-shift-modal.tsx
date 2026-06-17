'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface CancelShiftModalProps {
  open: boolean;
  onClose: () => void;
  date: string;
  shiftType: string;
  startTime?: string | null;
  endTime?: string | null;
  status: string;
  onConfirm: (note: string) => void;
}

export function CancelShiftModal({ open, onClose, date, shiftType, startTime, endTime, status, onConfirm }: CancelShiftModalProps) {
  const [note, setNote] = useState('');
  const isApproved = status === 'approved';
  const timeDisplay = startTime && endTime ? `${startTime} – ${endTime}` : shiftType;

  const canSubmit = !isApproved || note.trim().length > 0;

  const handleSubmit = () => {
    onConfirm(note.trim() || '');
    setNote('');
  };

  return (
    <Modal open={open} onClose={onClose} title="Cancel Shift">
      <div className="space-y-4 mb-6">
        <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
          <p className="text-sm text-wfd-charcoal"><strong>{date}</strong></p>
          <p className="text-xs text-gray-500">{timeDisplay}</p>
          <p className="text-xs text-gray-400 mt-1">
            Status: {status === 'pending' ? 'Pending Approval' : 'Approved'}
          </p>
        </div>

        {isApproved && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Reason for cancellation <span className="text-wfd-crimson">*</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Please explain why you need to cancel this approved shift..."
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-wfd-charcoal focus:border-wfd-crimson focus:ring-1 focus:ring-wfd-crimson resize-none"
            />
            {!note.trim() && (
              <p className="mt-1 text-xs text-amber-600">A reason is required to cancel an approved shift.</p>
            )}
          </div>
        )}

        <p className="text-xs text-gray-400">
          {isApproved
            ? 'Your reason will be included in the cancellation notification sent to the EMS Training Division.'
            : 'This pending request will be cancelled immediately.'}
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Keep Shift
        </Button>
        <Button variant="danger" onClick={handleSubmit} disabled={!canSubmit} className="flex-1">
          Cancel Shift
        </Button>
      </div>
    </Modal>
  );
}
