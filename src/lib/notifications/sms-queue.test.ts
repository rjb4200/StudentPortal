import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/sms', () => ({
  normalizePhoneNumber: vi.fn((phone: string | null | undefined) => phone === 'bad' ? null : '+15551234567'),
  sendSms: vi.fn(async () => ({ ok: true, providerMessageId: 'SM123' })),
}));

let tables: Record<string, any[]>;

function createClient() {
  return { from: (table: string) => createBuilder(table) };
}

function createBuilder(table: string) {
  const state: any = { filters: [], payload: null, selected: '*' };
  const builder: any = {
    select: vi.fn((selected = '*') => { state.selected = selected; return builder; }),
    insert: vi.fn((payload) => {
      const row = { id: 'queued-id', ...payload };
      tables[table].push(row);
      state.last = row;
      return builder;
    }),
    update: vi.fn((payload) => { state.payload = payload; return builder; }),
    eq: vi.fn((column, value) => { state.filters.push({ op: 'eq', column, value }); return builder; }),
    lte: vi.fn((column, value) => { state.filters.push({ op: 'lte', column, value }); return builder; }),
    in: vi.fn((column, value) => { state.filters.push({ op: 'in', column, value }); return builder; }),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => ({ data: filterRows(table, state)[0] ?? null, error: null })),
    single: vi.fn(async () => {
      if (state.last) return { data: pickSelected(state.last, state.selected), error: null };
      if (state.payload) {
        const row = filterRows(table, state)[0];
        if (row) Object.assign(row, state.payload);
        return { data: row ? pickSelected(row, state.selected) : null, error: null };
      }
      return { data: pickSelected(filterRows(table, state)[0], state.selected), error: null };
    }),
    then: (resolve: any) => {
      if (state.payload) {
        for (const row of filterRows(table, state)) Object.assign(row, state.payload);
      }
      return Promise.resolve({ data: filterRows(table, state).map((row) => pickSelected(row, state.selected)), error: null }).then(resolve);
    },
  };
  return builder;
}

function filterRows(table: string, state: any) {
  return (tables[table] ?? []).filter((row) => state.filters.every((filter: any) => {
    if (filter.op === 'eq') return row[filter.column] === filter.value;
    if (filter.op === 'lte') return row[filter.column] <= filter.value;
    if (filter.op === 'in') return filter.value.includes(row[filter.column]);
    return true;
  }));
}

function pickSelected(row: any, selected: string) {
  if (!row || selected === '*') return row;
  const result: any = {};
  for (const key of selected.split(',').map((part) => part.trim())) result[key] = row[key];
  return result;
}

beforeEach(() => {
  tables = {
    notification_queue: [],
    portal_settings: [{ key: 'sms_student_shift_approval_enabled', value: 'true' }],
    admin_accounts: [{ id: 'admin-id', phone: '5551234567', sms_opt_in: true, notify_sms_onboarding_complete: true, is_active: true }],
    schedules: [{ id: 'schedule-id', status: 'approved' }],
  };
});

describe('SMS queue helpers', () => {
  it('reads SMS settings', async () => {
    const { isSmsSettingEnabled } = await import('@/lib/notifications/sms-queue');

    await expect(isSmsSettingEnabled(createClient(), 'sms_student_shift_approval_enabled')).resolves.toBe(true);
  });

  it('enqueues normalized SMS notifications', async () => {
    const { enqueueSmsNotification } = await import('@/lib/notifications/sms-queue');

    const result = await enqueueSmsNotification(createClient(), {
      recipientType: 'student',
      recipientId: 'student-id',
      phoneNumber: '(555) 123-4567',
      notificationType: 'shift_approved',
      messageBody: 'WFD EMS Student Portal: approved.',
      scheduleId: 'schedule-id',
    });

    expect(result).toEqual({ ok: true, id: 'queued-id' });
    expect(tables.notification_queue[0]).toMatchObject({ phone_number: '+15551234567', status: 'pending' });
  });

  it('rejects invalid numbers before enqueueing', async () => {
    const { enqueueSmsNotification } = await import('@/lib/notifications/sms-queue');

    const result = await enqueueSmsNotification(createClient(), {
      recipientType: 'student',
      phoneNumber: 'bad',
      notificationType: 'shift_approved',
      messageBody: 'WFD EMS Student Portal: approved.',
    });

    expect(result.ok).toBe(false);
    expect(tables.notification_queue).toHaveLength(0);
  });

  it('marks successful sends and records provider id', async () => {
    const { markSmsSent } = await import('@/lib/notifications/sms-queue');
    tables.notification_queue.push({ id: 'n1', status: 'processing', attempt_count: 0 });

    await markSmsSent(createClient(), 'n1', 'SM123');

    expect(tables.notification_queue[0]).toMatchObject({ status: 'sent', provider_message_id: 'SM123', error_message: null });
  });

  it('marks failed sends and increments attempts', async () => {
    const { markSmsFailed } = await import('@/lib/notifications/sms-queue');
    tables.notification_queue.push({ id: 'n1', status: 'processing', attempt_count: 2 });

    await markSmsFailed(createClient(), 'n1', 'Twilio failed');

    expect(tables.notification_queue[0]).toMatchObject({ status: 'failed', error_message: 'Twilio failed', attempt_count: 3 });
  });

  it('queues approval and reminder SMS for opted-in students', async () => {
    tables.portal_settings.push({ key: 'sms_student_shift_reminders_enabled', value: 'true' });
    tables.portal_settings.push({ key: 'sms_reminder_send_time', value: '07:00' });
    const { queueShiftApprovalSmsNotifications } = await import('@/lib/notifications/sms-queue');

    const results = await queueShiftApprovalSmsNotifications(createClient(), {
      student: { id: 'student-id', phone: '5551234567', sms_opt_in: true },
      schedule: { id: 'schedule-id', date: '2026-06-25' },
      dateStr: 'Thursday, June 25, 2026',
      timeDisplay: 'day',
    });

    expect(results.every((result) => result.ok)).toBe(true);
    expect(tables.notification_queue).toHaveLength(2);
    expect(tables.notification_queue.map((row) => row.notification_type)).toEqual(['shift_approved', 'shift_reminder_day_before']);
  });

  it('does not queue schedule SMS without opt-in', async () => {
    const { queueShiftApprovalSmsNotifications } = await import('@/lib/notifications/sms-queue');

    const results = await queueShiftApprovalSmsNotifications(createClient(), {
      student: { id: 'student-id', phone: '5551234567', sms_opt_in: false },
      schedule: { id: 'schedule-id', date: '2026-06-25' },
      dateStr: 'Thursday, June 25, 2026',
      timeDisplay: 'day',
    });

    expect(results).toEqual([]);
    expect(tables.notification_queue).toHaveLength(0);
  });

  it('cancels pending schedule SMS rows', async () => {
    const { cancelPendingScheduleSms } = await import('@/lib/notifications/sms-queue');
    tables.notification_queue.push({ id: 'n1', schedule_id: 'schedule-id', channel: 'sms', status: 'pending' });

    await cancelPendingScheduleSms(createClient(), 'schedule-id');

    expect(tables.notification_queue[0].status).toBe('cancelled');
  });

  it('processes due SMS notifications and marks successful sends', async () => {
    const { processDueSmsNotifications } = await import('@/lib/notifications/sms-queue');
    tables.notification_queue.push({
      id: 'n1',
      channel: 'sms',
      status: 'pending',
      send_at: new Date(Date.now() - 1000).toISOString(),
      phone_number: '+15551234567',
      message_body: 'WFD EMS Student Portal: approved.',
      notification_type: 'shift_approved',
      schedule_id: null,
      attempt_count: 0,
    });

    const result = await processDueSmsNotifications(createClient());

    expect(result).toEqual({ processed: 1, sent: 1, failed: 0, cancelled: 0 });
    expect(tables.notification_queue[0]).toMatchObject({ status: 'sent', provider_message_id: 'SM123' });
  });

  it('cancels due reminders for shifts that are no longer approved', async () => {
    const { processDueSmsNotifications } = await import('@/lib/notifications/sms-queue');
    tables.schedules[0].status = 'cancelled';
    tables.notification_queue.push({
      id: 'n1',
      channel: 'sms',
      status: 'pending',
      send_at: new Date(Date.now() - 1000).toISOString(),
      phone_number: '+15551234567',
      message_body: 'WFD EMS Reminder: shift tomorrow.',
      notification_type: 'shift_reminder_day_before',
      schedule_id: 'schedule-id',
      attempt_count: 0,
    });

    const result = await processDueSmsNotifications(createClient());

    expect(result).toEqual({ processed: 1, sent: 0, failed: 0, cancelled: 1 });
    expect(tables.notification_queue[0].status).toBe('cancelled');
  });

  it('queues admin SMS alerts when global and account settings allow it', async () => {
    tables.portal_settings.push({ key: 'sms_admin_alerts_enabled', value: 'true' });
    const { queueAdminSmsAlerts } = await import('@/lib/notifications/sms-queue');

    const results = await queueAdminSmsAlerts(createClient(), {
      notificationType: 'admin_onboarding_complete',
      messageBody: 'WFD EMS Student Portal: New onboarding completed.',
      preferenceColumn: 'notify_sms_onboarding_complete',
    });

    expect(results).toEqual([{ ok: true, id: 'queued-id' }]);
    expect(tables.notification_queue[0]).toMatchObject({ recipient_type: 'admin', recipient_id: 'admin-id' });
  });
});
