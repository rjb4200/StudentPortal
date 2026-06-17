'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { START_TIME_OPTIONS, END_TIME_OPTIONS } from '@/lib/time-formats';

interface ShiftModalProps {
  open: boolean;
  onClose: () => void;
  date: string | null;
  onSubmit: (shiftType: 'full' | 'day' | 'custom', startTime: string, endTime: string) => void;
}

const CUSTOM_DEFAULT_START = '7:00 AM';

export function ShiftModal({ open, onClose, date, onSubmit }: ShiftModalProps) {
  const [selected, setSelected] = useState<'full' | 'day' | 'custom'>('full');
  const [customStart, setCustomStart] = useState(CUSTOM_DEFAULT_START);
  const [customEnd, setCustomEnd] = useState('7:00 PM');

  const handleSubmit = () => {
    if (selected === 'day') {
      onSubmit('day', '7:00 AM', '7:00 PM');
    } else if (selected === 'full') {
      onSubmit('full', '7:00 AM', '7:00 AM');
    } else {
      onSubmit('custom', customStart, customEnd);
    }
    setSelected('full');
    setCustomStart(CUSTOM_DEFAULT_START);
    setCustomEnd('7:00 PM');
  };

  const showNag = selected === 'custom' && customStart !== CUSTOM_DEFAULT_START;

  return (
    <Modal open={open} onClose={onClose} title={`Request Shift — ${date || ''}`}>
      <div className="space-y-3 mb-6">
        <label
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            selected === 'day'
              ? 'border-wfd-crimson bg-wfd-crimson/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="shiftType"
            value="day"
            checked={selected === 'day'}
            onChange={() => setSelected('day')}
            className="text-wfd-crimson focus:ring-wfd-crimson"
          />
          <div>
            <div className="font-medium text-wfd-charcoal text-sm">Day Shift</div>
            <div className="text-xs text-gray-500">7:00 AM – 7:00 PM</div>
          </div>
        </label>

        <label
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            selected === 'full'
              ? 'border-wfd-crimson bg-wfd-crimson/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="shiftType"
            value="full"
            checked={selected === 'full'}
            onChange={() => setSelected('full')}
            className="text-wfd-crimson focus:ring-wfd-crimson"
          />
          <div>
            <div className="font-medium text-wfd-charcoal text-sm">Full Shift</div>
            <div className="text-xs text-gray-500">7:00 AM – 7:00 AM (next day)</div>
          </div>
        </label>

        <label
          className={`block p-3 rounded-lg border transition-colors ${
            selected === 'custom'
              ? 'border-wfd-crimson bg-wfd-crimson/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelected('custom')}>
            <input
              type="radio"
              name="shiftType"
              value="custom"
              checked={selected === 'custom'}
              onChange={() => setSelected('custom')}
              className="text-wfd-crimson focus:ring-wfd-crimson"
            />
            <div className="font-medium text-wfd-charcoal text-sm">Custom</div>
          </div>

          {selected === 'custom' && (
            <div className="mt-3 ml-7 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                <select
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-wfd-charcoal focus:border-wfd-crimson focus:ring-1 focus:ring-wfd-crimson"
                >
                  {START_TIME_OPTIONS.map((t) => (
                    <option
                      key={t}
                      value={t}
                      className={t === CUSTOM_DEFAULT_START ? 'font-bold' : ''}
                    >
                      {t === CUSTOM_DEFAULT_START ? `07:00 (recommended)` : t}
                    </option>
                  ))}
                </select>
                {showNag && (
                  <p className="mt-1 text-xs text-amber-600">
                    The shift starts at 0700. The best student experience would be to arrive at that time.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
                <select
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-wfd-charcoal focus:border-wfd-crimson focus:ring-1 focus:ring-wfd-crimson"
                >
                  {END_TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </label>
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
