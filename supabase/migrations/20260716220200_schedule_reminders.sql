CREATE TABLE IF NOT EXISTS public.schedule_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  reminder_type text NOT NULL CHECK (reminder_type = 'day_before'),
  status text NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed', 'delivered', 'failed')),
  claimed_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT schedule_reminders_schedule_type_key UNIQUE (schedule_id, reminder_type)
);

ALTER TABLE public.schedule_reminders ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.schedule_reminders TO service_role;

CREATE POLICY "Admins can read schedule reminders" ON public.schedule_reminders
  FOR SELECT
  TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
