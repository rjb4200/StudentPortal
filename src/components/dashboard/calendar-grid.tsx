'use client';

import { useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isToday,
  isPast,
  isSameMonth,
} from 'date-fns';
import { abbreviated12 } from '@/lib/time-formats';
import { getShiftRotation } from '@/lib/shift-rotation';

interface Schedule {
  id: string;
  date: string;
  shift_type: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  start_time?: string | null;
  end_time?: string | null;
}

interface CalendarGridProps {
  schedules: Schedule[];
  onDateClick: (date: string) => void;
  classStartDate?: string | null;
  rideTimeEndDate?: string | null;
}

const ROTATION_TAG_STYLES = {
  orange: 'border-orange-300 bg-orange-100 text-orange-900',
  yellow: 'border-yellow-300 bg-yellow-100 text-yellow-900',
  gray: 'border-gray-300 bg-gray-100 text-gray-700',
};

const ROTATION_SHORT_LABELS = {
  'First Shift': '1st Shift',
  'Second Shift': '2nd Shift',
  'Third Shift': '3rd Shift',
} as const;

export function CalendarGrid({ schedules, onDateClick, classStartDate, rideTimeEndDate }: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getScheduleForDate = (date: Date): Schedule | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedules.find((s) => s.date === dateStr);
  };

  const getCellStyle = (date: Date, schedule?: Schedule) => {
    if (!schedule) return '';
    switch (schedule.status) {
      case 'pending':
        return 'bg-wfd-gold/15 border-wfd-gold/30 text-wfd-gold';
      case 'approved':
        return 'bg-wfd-crimson text-white font-semibold';
      case 'cancelled':
        return 'bg-amber-100 text-amber-800';
      case 'rejected':
        return 'bg-gray-100 text-gray-400 line-through';
      default:
        return '';
    }
  };

  const getStatusLabel = (schedule: Schedule) => {
    switch (schedule.status) {
      case 'pending': return { icon: '\u231B', text: 'Pending' };
      case 'approved': return { icon: '\u2713', text: 'Approved' };
      case 'cancelled': return { icon: '\u2014', text: 'Cancelled' };
      case 'rejected': return { icon: '\u2715', text: 'Rejected' };
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="px-3 py-1 text-sm text-gray-600 hover:text-wfd-crimson font-medium"
        >
          &larr; Prev
        </button>
        <h3 className="text-lg font-bold text-wfd-charcoal">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="px-3 py-1 text-sm text-gray-600 hover:text-wfd-crimson font-medium"
        >
          Next &rarr;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">
            {d}
          </div>
        ))}

        {days.map((day) => {
          const schedule = getScheduleForDate(day);
          const dateStr = format(day, 'yyyy-MM-dd');
          const rotation = getShiftRotation(dateStr);
          const past = isPast(day) && !isToday(day);
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const outsideClassWindow = !!classStartDate && !!rideTimeEndDate && (dateStr < classStartDate || dateStr > rideTimeEndDate);
          const disabled = past || outsideClassWindow;

          return (
            <button
              key={dateStr}
              onClick={() => onDateClick(dateStr)}
              disabled={disabled}
              title={outsideClassWindow ? 'Outside your class ride-time window' : past && !schedule ? 'Past dates are unavailable for scheduling' : undefined}
              className={`relative aspect-square rounded-lg p-1 text-sm transition-colors
                ${!inMonth ? 'text-gray-300' : ''}
                ${disabled ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}
                ${today ? 'ring-2 ring-wfd-crimson ring-offset-1' : ''}
                ${getCellStyle(day, schedule)}
              `}
            >
              <span className="absolute left-1 top-1 flex max-w-[calc(100%-0.5rem)] items-start gap-1">
                <span className="text-xs leading-3">{format(day, 'd')}</span>
                <span
                  className={`min-w-0 truncate rounded border px-1 text-[8px] font-semibold leading-3 ${ROTATION_TAG_STYLES[rotation.color]}`}
                  title={`${rotation.label} - ${rotation.chief}`}
                >
                  {ROTATION_SHORT_LABELS[rotation.label]}
                </span>
              </span>
              {schedule && (
                <span className="absolute left-1 top-5 text-[10px] leading-tight">
                  {schedule.start_time && schedule.end_time
                    ? `${abbreviated12(schedule.start_time)}–${abbreviated12(schedule.end_time)}`
                    : schedule.shift_type === 'full'
                    ? 'Full'
                    : schedule.shift_type === 'day'
                    ? 'Day'
                    : schedule.shift_type === 'custom'
                    ? 'Custom'
                    : 'Night'}
                </span>
              )}
              {schedule && getStatusLabel(schedule) && (
                <span className="absolute bottom-1 left-1 text-[9px] leading-tight">{getStatusLabel(schedule)!.icon} {getStatusLabel(schedule)!.text}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-wfd-gold/15 border border-wfd-gold/30" /> Pending
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-wfd-crimson" /> Approved
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-100" /> Cancelled
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-100" /> Rejected
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-50 border border-gray-200" /> Unavailable
        </span>
      </div>
    </div>
  );
}
