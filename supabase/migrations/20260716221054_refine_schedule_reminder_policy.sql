DROP INDEX IF EXISTS public.idx_schedule_reminders_status_claimed_at;

ALTER POLICY "Admins can read schedule reminders" ON public.schedule_reminders
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
