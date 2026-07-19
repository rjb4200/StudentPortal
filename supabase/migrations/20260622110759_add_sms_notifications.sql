ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS sms_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sms_verified boolean NOT NULL DEFAULT false;

ALTER TABLE public.admin_accounts
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS sms_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sms_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_sms_onboarding_complete boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_sms_evaluation_flagged boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_sms_schedule_requests boolean NOT NULL DEFAULT false;

ALTER TABLE public.admin_accounts
  ADD CONSTRAINT ck_admin_accounts_phone_length
  CHECK (phone IS NULL OR length(phone) <= 30);

CREATE TABLE IF NOT EXISTS public.notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type text NOT NULL CHECK (recipient_type IN ('student', 'admin', 'instructor')),
  recipient_id uuid,
  phone_number text NOT NULL,
  notification_type text NOT NULL,
  channel text NOT NULL DEFAULT 'sms' CHECK (channel = 'sms'),
  message_body text NOT NULL CHECK (length(message_body) > 0 AND length(message_body) <= 1600),
  send_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  provider text NOT NULL DEFAULT 'twilio',
  provider_message_id text,
  error_message text,
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  last_attempt_at timestamptz,
  schedule_id uuid REFERENCES public.schedules(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_due ON public.notification_queue (send_at, status) WHERE channel = 'sms' AND status = 'pending';
CREATE INDEX IF NOT EXISTS idx_notification_queue_recipient ON public.notification_queue (recipient_type, recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status_created ON public.notification_queue (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_queue_schedule ON public.notification_queue (schedule_id) WHERE schedule_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_queue_unique_shift_reminder ON public.notification_queue (schedule_id, notification_type, channel) WHERE schedule_id IS NOT NULL AND notification_type = 'shift_reminder_day_before' AND channel = 'sms' AND status <> 'cancelled';

ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read notification queue" ON public.notification_queue FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.admin_accounts WHERE admin_accounts.auth_user_id = (SELECT auth.uid()) AND admin_accounts.is_active = true)
);

GRANT SELECT ON public.notification_queue TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_queue TO service_role;

INSERT INTO public.portal_settings (key, value) VALUES
  ('sms_student_shift_approval_enabled', 'false'),
  ('sms_student_shift_reminders_enabled', 'false'),
  ('sms_admin_alerts_enabled', 'false'),
  ('sms_reminder_send_time', '07:00')
ON CONFLICT (key) DO NOTHING;
