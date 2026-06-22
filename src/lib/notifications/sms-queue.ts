import 'server-only';

import { normalizePhoneNumber, sendSms } from '@/lib/sms';

export const SMS_SETTINGS = {
  shiftApproval: 'sms_student_shift_approval_enabled',
  shiftReminders: 'sms_student_shift_reminders_enabled',
  adminAlerts: 'sms_admin_alerts_enabled',
  reminderSendTime: 'sms_reminder_send_time',
} as const;

type SupabaseLike = any;

type RecipientType = 'student' | 'admin' | 'instructor';
type SmsStatus = 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';

interface EnqueueSmsParams {
  recipientType: RecipientType;
  recipientId?: string | null;
  phoneNumber: string | null | undefined;
  notificationType: string;
  messageBody: string;
  sendAt?: string | Date;
  scheduleId?: string | null;
}

interface QueueResult {
  ok: boolean;
  id?: string;
  error?: string;
}

interface StudentSmsRecipient {
  id: string;
  phone: string | null;
  sms_opt_in?: boolean | null;
}

interface ScheduleSmsContext {
  id: string;
  date: string;
}

interface AdminSmsAlertParams {
  notificationType: string;
  messageBody: string;
  preferenceColumn: 'notify_sms_onboarding_complete' | 'notify_sms_evaluation_flagged' | 'notify_sms_schedule_requests';
}

interface DueNotification {
  id: string;
  phone_number: string;
  message_body: string;
  notification_type: string;
  schedule_id: string | null;
}

export async function getPortalSetting(supabase: SupabaseLike, key: string): Promise<string | null> {
  const { data } = await supabase
    .from('portal_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  return data?.value ?? null;
}

export async function isSmsSettingEnabled(supabase: SupabaseLike, key: string): Promise<boolean> {
  return (await getPortalSetting(supabase, key)) === 'true';
}

export async function enqueueSmsNotification(supabase: SupabaseLike, params: EnqueueSmsParams): Promise<QueueResult> {
  const phoneNumber = normalizePhoneNumber(params.phoneNumber);
  if (!phoneNumber) {
    return { ok: false, error: 'Invalid destination phone number' };
  }

  const { data, error } = await supabase
    .from('notification_queue')
    .insert({
      recipient_type: params.recipientType,
      recipient_id: params.recipientId ?? null,
      phone_number: phoneNumber,
      notification_type: params.notificationType,
      channel: 'sms',
      message_body: params.messageBody,
      send_at: params.sendAt instanceof Date ? params.sendAt.toISOString() : params.sendAt ?? new Date().toISOString(),
      schedule_id: params.scheduleId ?? null,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, id: data?.id };
}

export async function cancelPendingScheduleSms(supabase: SupabaseLike, scheduleId: string): Promise<void> {
  await supabase
    .from('notification_queue')
    .update({ status: 'cancelled' satisfies SmsStatus, updated_at: new Date().toISOString() })
    .eq('schedule_id', scheduleId)
    .eq('channel', 'sms')
    .in('status', ['pending', 'processing']);
}

export async function markSmsSent(supabase: SupabaseLike, id: string, providerMessageId?: string | null): Promise<void> {
  await supabase
    .from('notification_queue')
    .update({
      status: 'sent' satisfies SmsStatus,
      sent_at: new Date().toISOString(),
      provider_message_id: providerMessageId ?? null,
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
}

export async function markSmsFailed(supabase: SupabaseLike, id: string, errorMessage: string): Promise<void> {
  const { data } = await supabase
    .from('notification_queue')
    .select('attempt_count')
    .eq('id', id)
    .single();

  await supabase
    .from('notification_queue')
    .update({
      status: 'failed' satisfies SmsStatus,
      error_message: errorMessage,
      attempt_count: (data?.attempt_count ?? 0) + 1,
      last_attempt_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
}

export function getDayBeforeReminderSendAt(shiftDate: string, sendTime: string | null): Date {
  const [year, month, day] = shiftDate.split('-').map(Number);
  const [hour, minute] = (sendTime || '07:00').split(':').map(Number);
  return new Date(year, month - 1, day - 1, hour || 0, minute || 0, 0, 0);
}

export async function claimDueSmsNotifications(supabase: SupabaseLike, limit = 25): Promise<DueNotification[]> {
  const { data: pending } = await supabase
    .from('notification_queue')
    .select('id, phone_number, message_body, notification_type, schedule_id')
    .eq('channel', 'sms')
    .eq('status', 'pending')
    .lte('send_at', new Date().toISOString())
    .order('send_at', { ascending: true })
    .limit(limit);

  const claimed: DueNotification[] = [];
  for (const row of pending ?? []) {
    const { data } = await supabase
      .from('notification_queue')
      .update({ status: 'processing' satisfies SmsStatus, updated_at: new Date().toISOString() })
      .eq('id', row.id)
      .eq('status', 'pending')
      .select('id, phone_number, message_body, notification_type, schedule_id')
      .single();
    if (data) claimed.push(data);
  }

  return claimed;
}

export async function processDueSmsNotifications(supabase: SupabaseLike, limit = 25): Promise<{ processed: number; sent: number; failed: number; cancelled: number }> {
  const due = await claimDueSmsNotifications(supabase, limit);
  let sent = 0;
  let failed = 0;
  let cancelled = 0;

  for (const notification of due) {
    if (notification.notification_type === 'shift_reminder_day_before' && notification.schedule_id) {
      const { data: schedule } = await supabase
        .from('schedules')
        .select('status')
        .eq('id', notification.schedule_id)
        .single();
      if (schedule?.status !== 'approved') {
        await supabase
          .from('notification_queue')
          .update({ status: 'cancelled' satisfies SmsStatus, updated_at: new Date().toISOString() })
          .eq('id', notification.id);
        cancelled += 1;
        continue;
      }
    }

    const result = await sendSms({ to: notification.phone_number, body: notification.message_body });
    if (result.ok) {
      await markSmsSent(supabase, notification.id, result.providerMessageId ?? null);
      sent += 1;
    } else {
      await markSmsFailed(supabase, notification.id, result.error || 'SMS delivery failed');
      failed += 1;
    }
  }

  return { processed: due.length, sent, failed, cancelled };
}

export async function queueShiftApprovalSmsNotifications(
  supabase: SupabaseLike,
  params: { student: StudentSmsRecipient; schedule: ScheduleSmsContext; dateStr: string; timeDisplay: string }
): Promise<QueueResult[]> {
  const { student, schedule, dateStr, timeDisplay } = params;
  if (!student.sms_opt_in) return [];

  const results: QueueResult[] = [];

  if (await isSmsSettingEnabled(supabase, SMS_SETTINGS.shiftApproval)) {
    results.push(await enqueueSmsNotification(supabase, {
      recipientType: 'student',
      recipientId: student.id,
      phoneNumber: student.phone,
      notificationType: 'shift_approved',
      messageBody: `WFD EMS Student Portal: Your shift on ${dateStr} (${timeDisplay}) has been approved. Reminder details will be sent before your shift.`,
      scheduleId: schedule.id,
    }));
  }

  if (await isSmsSettingEnabled(supabase, SMS_SETTINGS.shiftReminders)) {
    const reminderSendTime = await getPortalSetting(supabase, SMS_SETTINGS.reminderSendTime);
    results.push(await enqueueSmsNotification(supabase, {
      recipientType: 'student',
      recipientId: student.id,
      phoneNumber: student.phone,
      notificationType: 'shift_reminder_day_before',
      messageBody: `WFD EMS Reminder: You are scheduled for a shift tomorrow, ${dateStr} (${timeDisplay}). Please arrive on time and follow student rotation instructions.`,
      sendAt: getDayBeforeReminderSendAt(schedule.date, reminderSendTime),
      scheduleId: schedule.id,
    }));
  }

  return results;
}

export async function queueAdminSmsAlerts(supabase: SupabaseLike, params: AdminSmsAlertParams): Promise<QueueResult[]> {
  if (!(await isSmsSettingEnabled(supabase, SMS_SETTINGS.adminAlerts))) return [];

  const { data: admins } = await supabase
    .from('admin_accounts')
    .select(`id, phone, sms_opt_in, ${params.preferenceColumn}`)
    .eq('is_active', true)
    .eq('sms_opt_in', true)
    .eq(params.preferenceColumn, true);

  const results: QueueResult[] = [];
  for (const admin of admins ?? []) {
    results.push(await enqueueSmsNotification(supabase, {
      recipientType: 'admin',
      recipientId: admin.id,
      phoneNumber: admin.phone,
      notificationType: params.notificationType,
      messageBody: params.messageBody,
    }));
  }

  return results;
}
