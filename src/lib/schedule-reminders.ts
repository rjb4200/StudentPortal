import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

export const DAY_BEFORE_REMINDER = 'day_before';

function easternDateParts(value: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);

  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  return { year: Number(get('year')), month: Number(get('month')), day: Number(get('day')) };
}

export function tomorrowInEastern(now = new Date()) {
  const { year, month, day } = easternDateParts(now);
  const tomorrow = new Date(Date.UTC(year, month - 1, day + 1));
  return tomorrow.toISOString().slice(0, 10);
}

export function isDuplicateReminderError(error: { code?: string | null } | null) {
  return error?.code === '23505';
}

export function isEligibleReminderSchedule(
  schedule: { date: string; status: string },
  reminderDate: string
) {
  return schedule.status === 'approved' && schedule.date === reminderDate;
}

export function getReminderDeliveryOutcome(result: { ok: boolean; error?: string }) {
  return result.ok
    ? { delivered: true } as const
    : { delivered: false, errorMessage: result.error ?? 'Email delivery failed' } as const;
}

export async function claimScheduleReminder(
  supabase: SupabaseClient<Database>,
  scheduleId: string
) {
  const { error } = await supabase.from('schedule_reminders').insert({
    schedule_id: scheduleId,
    reminder_type: DAY_BEFORE_REMINDER,
  });

  if (!error) return true;
  if (isDuplicateReminderError(error)) return false;
  throw error;
}

export async function completeScheduleReminder(
  supabase: SupabaseClient<Database>,
  scheduleId: string,
  outcome: { delivered: true } | { delivered: false; errorMessage: string }
) {
  const { error } = await supabase
    .from('schedule_reminders')
    .update(
      outcome.delivered
        ? { status: 'delivered', delivered_at: new Date().toISOString(), error_message: null }
        : { status: 'failed', error_message: outcome.errorMessage }
    )
    .eq('schedule_id', scheduleId)
    .eq('reminder_type', DAY_BEFORE_REMINDER);

  if (error) throw error;
}
