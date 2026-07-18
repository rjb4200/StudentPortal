CREATE TABLE public.schedule_blocks (
  date date PRIMARY KEY,
  reason text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT schedule_blocks_reason_length CHECK (reason IS NULL OR char_length(reason) BETWEEN 1 AND 500)
);

CREATE INDEX idx_schedule_blocks_date ON public.schedule_blocks (date);

ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read schedule blocks" ON public.schedule_blocks
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can create schedule blocks" ON public.schedule_blocks
  FOR INSERT TO authenticated
  WITH CHECK (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update schedule blocks" ON public.schedule_blocks
  FOR UPDATE TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' -> 'role') = '"admin"'::jsonb)
  WITH CHECK (((select auth.jwt()) -> 'app_metadata' -> 'role') = '"admin"'::jsonb);

CREATE POLICY "Admins can delete schedule blocks" ON public.schedule_blocks
  FOR DELETE TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

CREATE OR REPLACE FUNCTION public.reject_schedule_on_blocked_date()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.schedule_blocks WHERE date = NEW.date) THEN
    RAISE EXCEPTION 'Schedule date is unavailable because it has been blocked by an administrator.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reject_schedule_on_blocked_date ON public.schedules;
CREATE TRIGGER reject_schedule_on_blocked_date
  BEFORE INSERT ON public.schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.reject_schedule_on_blocked_date();

CREATE OR REPLACE FUNCTION public.resolve_schedule_and_block_day(
  p_schedule_id uuid,
  p_action public.schedule_status,
  p_reason text,
  p_admin_id uuid
)
RETURNS TABLE (schedule_id uuid, schedule_date date, schedule_status public.schedule_status)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_schedule public.schedules%ROWTYPE;
  normalized_reason text;
BEGIN
  IF p_action NOT IN ('approved'::public.schedule_status, 'rejected'::public.schedule_status) THEN
    RAISE EXCEPTION 'Combined block actions must approve or reject a pending schedule.';
  END IF;

  SELECT * INTO target_schedule
  FROM public.schedules
  WHERE id = p_schedule_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Schedule not found.';
  END IF;

  IF target_schedule.status <> 'pending'::public.schedule_status THEN
    RAISE EXCEPTION 'Only pending schedules can be resolved and blocked.';
  END IF;

  normalized_reason := NULLIF(btrim(p_reason), '');

  INSERT INTO public.schedule_blocks (date, reason, created_by)
  VALUES (target_schedule.date, normalized_reason, p_admin_id)
  ON CONFLICT (date) DO UPDATE
  SET reason = COALESCE(EXCLUDED.reason, public.schedule_blocks.reason),
      updated_at = now();

  UPDATE public.schedules
  SET status = p_action
  WHERE id = target_schedule.id;

  RETURN QUERY
  SELECT target_schedule.id, target_schedule.date, p_action;
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_schedule_and_block_day(uuid, public.schedule_status, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.resolve_schedule_and_block_day(uuid, public.schedule_status, text, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.resolve_schedule_and_block_day(uuid, public.schedule_status, text, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_schedule_and_block_day(uuid, public.schedule_status, text, uuid) TO service_role;
