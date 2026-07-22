-- Migration: add notify_schedule_requested toggle to admin_accounts
ALTER TABLE public.admin_accounts
ADD COLUMN IF NOT EXISTS notify_schedule_requested boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.admin_accounts.notify_schedule_requested IS 'When true, admin receives email when a student submits a new shift request.';
