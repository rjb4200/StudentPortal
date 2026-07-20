import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Json } from '@/lib/supabase/database.types';
import { publicEnv } from '@/lib/env';
import { sendEmail } from '@/lib/email';
import { buildShiftReminderEmail } from '@/lib/email-templates';
import { completeScheduleReminder, claimScheduleReminder, getReminderDeliveryOutcome, isEligibleReminderSchedule, tomorrowInEastern } from '@/lib/schedule-reminders';
import { getShiftRotation } from '@/lib/shift-rotation';
import { getStationOneMapUrl } from '@/lib/station-map';

export const dynamic = 'force-dynamic';

const SHIFT_REMINDER_JOB = 'shift_reminders';

type ReminderSchedule = {
  id: string;
  date: string;
  shift_type: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  students: { email: string; full_name: string } | null;
};

async function recordJobRun(
  supabase: ReturnType<typeof createAdminClient>,
  params: {
    status: 'success' | 'failure';
    startedAt: Date;
    finishedAt: Date;
    summary?: Json;
    errorMessage?: string;
  }
) {
  const { error } = await supabase.from('system_job_runs').insert({
    job_name: SHIFT_REMINDER_JOB,
    status: params.status,
    started_at: params.startedAt.toISOString(),
    finished_at: params.finishedAt.toISOString(),
    duration_ms: Math.max(0, params.finishedAt.getTime() - params.startedAt.getTime()),
    summary: params.summary ?? {},
    error_message: params.errorMessage,
  });

  if (error) console.error('Failed to record shift reminder job run:', error.message);
}

function formatRideDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatRideTime(schedule: ReminderSchedule) {
  return schedule.start_time && schedule.end_time
    ? `${schedule.start_time} - ${schedule.end_time}`
    : schedule.shift_type;
}

export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected || request.headers.get('authorization') !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startedAt = new Date();
  const supabase = createAdminClient();
  const reminderDate = tomorrowInEastern(startedAt);
  const summary = { reminderDate, eligible: 0, claimed: 0, delivered: 0, skippedDuplicates: 0, failed: 0 };

  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('id, date, shift_type, start_time, end_time, status, students!inner(email, full_name)')
      .eq('status', 'approved')
      .eq('date', reminderDate);
    if (error) throw error;

    const schedules = (data ?? []) as unknown as ReminderSchedule[];
    const eligibleSchedules = schedules.filter((schedule) => isEligibleReminderSchedule(schedule, reminderDate) && schedule.students);
    summary.eligible = eligibleSchedules.length;

    let stationMapUrl: string | null = null;
    try {
      stationMapUrl = await getStationOneMapUrl(supabase, publicEnv.SITE_URL);
      if (!stationMapUrl) console.error('Station 1 map is not configured for shift reminders.');
    } catch (error) {
      console.error('Unable to resolve Station 1 map for shift reminders:', error);
    }

    for (const schedule of eligibleSchedules) {
      const claimed = await claimScheduleReminder(supabase, schedule.id);
      if (!claimed) {
        summary.skippedDuplicates += 1;
        continue;
      }
      summary.claimed += 1;

      const rotation = getShiftRotation(schedule.date);
      const content = buildShiftReminderEmail({
        full_name: schedule.students!.full_name,
        date_str: formatRideDate(schedule.date),
        time_display: formatRideTime(schedule),
        shift_label: rotation.label,
        chief_name: rotation.chief,
        dashboard_url: `${publicEnv.SITE_URL}/dashboard`,
        station_map_url: stationMapUrl,
      });
      const result = await sendEmail({
        to: schedule.students!.email,
        subject: content.subject,
        html: content.html,
      });

      const outcome = getReminderDeliveryOutcome(result);
      if (outcome.delivered) {
        await completeScheduleReminder(supabase, schedule.id, { delivered: true });
        summary.delivered += 1;
      } else {
        await completeScheduleReminder(supabase, schedule.id, outcome);
        summary.failed += 1;
      }
    }

    const finishedAt = new Date();
    await recordJobRun(supabase, { status: 'success', startedAt, finishedAt, summary });
    return NextResponse.json(summary);
  } catch (error) {
    const finishedAt = new Date();
    const message = error instanceof Error ? error.message : 'Shift reminder job failed';
    await recordJobRun(supabase, { status: 'failure', startedAt, finishedAt, summary, errorMessage: message });
    return NextResponse.json({ error: message, ...summary }, { status: 500 });
  }
}
