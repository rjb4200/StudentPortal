import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Json } from '@/lib/supabase/database.types';
import type { FirstDueRepository, LinkState, SyncLink, SyncSchedule } from '@/lib/first-due/sync';

export const FIRST_DUE_SYNC_JOB = 'first_due_sync';

type ScheduleRow = {
  id: string;
  date: string;
  shift_type: string;
  start_time: string | null;
  end_time: string | null;
  students: { full_name: string; training_class_id: string | null } | null;
  preceptors: { full_name: string } | null;
};

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

export function createFirstDueRepository(supabase: SupabaseAdmin = createAdminClient()): FirstDueRepository {
  return {
    async listApprovedSchedules(from, to) {
      const { data, error } = await supabase
        .from('schedules')
        .select('id, date, shift_type, start_time, end_time, students!inner(full_name, training_class_id), preceptors(full_name)')
        .eq('status', 'approved')
        .gte('date', from)
        .lte('date', to);

      if (error) throw error;

      const rows = (data ?? []) as unknown as ScheduleRow[];
      const classIds = [
        ...new Set(rows.map((row) => row.students?.training_class_id).filter((id): id is string => Boolean(id))),
      ];

      let classNames = new Map<string, string>();
      if (classIds.length > 0) {
        const { data: classes, error: classError } = await supabase
          .from('training_classes')
          .select('id, name')
          .in('id', classIds);
        if (classError) throw classError;
        classNames = new Map((classes ?? []).map((item) => [item.id, item.name]));
      }

      return rows.map(
        (row): SyncSchedule => ({
          id: row.id,
          date: row.date,
          shift_type: row.shift_type,
          start_time: row.start_time,
          end_time: row.end_time,
          studentName: row.students?.full_name ?? 'Unknown student',
          className: row.students?.training_class_id
            ? classNames.get(row.students.training_class_id) ?? null
            : null,
          preceptorName: row.preceptors?.full_name ?? null,
        })
      );
    },

    async listLinks(from, to) {
      const { data, error } = await supabase
        .from('first_due_event_links')
        .select('schedule_id, event_id, state, schedules!inner(date, status)')
        .gte('schedules.date', from)
        .lte('schedules.date', to);

      if (error) throw error;

      return ((data ?? []) as unknown as {
        schedule_id: string;
        event_id: number | null;
        state: string;
        schedules: { date: string; status: string } | null;
      }[]).map((row) => ({
        scheduleId: row.schedule_id,
        eventId: row.event_id,
        state: row.state as LinkState,
        date: row.schedules?.date ?? '',
        status: row.schedules?.status ?? 'unknown',
      }));
    },

    async getLink(scheduleId) {
      const { data, error } = await supabase
        .from('first_due_event_links')
        .select('event_id, token, state')
        .eq('schedule_id', scheduleId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        eventId: data.event_id,
        token: data.token,
        state: data.state as LinkState,
      };
    },

    async saveLink(link: SyncLink) {
      const now = new Date().toISOString();
      const { error } = await supabase.from('first_due_event_links').upsert(
        {
          schedule_id: link.scheduleId,
          token: link.token,
          state: link.state,
          last_error: link.error ?? null,
          event_id: link.eventId ?? null,
          ...(link.state === 'posted' ? { posted_at: now } : {}),
          ...(link.state === 'verified' ? { verified_at: now } : {}),
        },
        { onConflict: 'schedule_id' }
      );

      if (error) throw error;
    },

    async recordJobRun(run) {
      const { error } = await supabase.from('system_job_runs').insert({
        job_name: FIRST_DUE_SYNC_JOB,
        status: run.status,
        started_at: run.startedAt.toISOString(),
        finished_at: run.finishedAt.toISOString(),
        duration_ms: Math.max(0, run.finishedAt.getTime() - run.startedAt.getTime()),
        summary: (run.summary ?? {}) as Json,
        error_message: run.errorMessage,
      });

      if (error) console.error('Failed to record First Due sync job run:', error.message);
    },
  };
}

export async function countDriftedLinks(supabase: SupabaseAdmin = createAdminClient()): Promise<number> {
  const { count, error } = await supabase
    .from('first_due_event_links')
    .select('id', { count: 'exact', head: true })
    .eq('state', 'drifted');

  if (error) {
    console.error('Failed to count drifted First Due links:', error.message);
    return 0;
  }
  return count ?? 0;
}
