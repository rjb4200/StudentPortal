'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface ShiftModalProps {
  open: boolean;
  onClose: () => void;
  date: string | null;
  onSubmit: (shiftType: 'full' | 'day' | 'night') => void;
}

export function ShiftModal({ open, onClose, date, onSubmit }: ShiftModalProps) {
  const [selected, setSelected] = useState<'full' | 'day' | 'night'>('full');

  const shiftOptions = [
    { value: 'full' as const, label: 'Full Shift', desc: 'Entire 24-hour shift' },
    { value: 'day' as const, label: 'Day Shift', desc: '7 AM to 7 PM' },
    { value: 'night' as const, label: 'Night Shift', desc: '7 PM to 7 AM' },
  ];

  const handleSubmit = () => {
    onSubmit(selected);
    setSelected('full');
  };

  return (
    <Modal open={open} onClose={onClose} title={`Request Shift — ${date || ''}`}>
      <div className="space-y-3 mb-6">
        {shiftOptions.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              selected === opt.value
                ? 'border-wfd-crimson bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="shiftType"
              value={opt.value}
              checked={selected === opt.value}
              onChange={() => setSelected(opt.value)}
              className="text-wfd-crimson focus:ring-wfd-crimson"
            />
            <div>
              <div className="font-medium text-wfd-charcoal text-sm">{opt.label}</div>
              <div className="text-xs text-gray-500">{opt.desc}</div>
            </div>
          </label>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="flex-1">
          Confirm Request
        </Button>
      </div>
    </Modal>
  );
}
