CREATE OR REPLACE FUNCTION public.block_schedule_date_range(
  p_start_date date,
  p_end_date date,
  p_reason text,
  p_admin_id uuid
)
RETURNS TABLE (
  total_days integer,
  created_blocks integer,
  already_blocked integer,
  pending_schedules integer,
  approved_schedules integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_reason text := NULLIF(btrim(p_reason), '');
BEGIN
  IF p_start_date IS NULL OR p_end_date IS NULL OR p_end_date < p_start_date THEN
    RAISE EXCEPTION 'Schedule block range must have an end date on or after its start date.';
  END IF;

  IF p_end_date - p_start_date + 1 > 31 THEN
    RAISE EXCEPTION 'Schedule block ranges cannot exceed 31 days.';
  END IF;

  RETURN QUERY
  WITH range_days AS (
    SELECT day::date AS date
    FROM generate_series(p_start_date, p_end_date, interval '1 day') AS day
  ),
  range_summary AS (
    SELECT
      (SELECT count(*)::integer FROM range_days) AS total_days,
      (SELECT count(*)::integer FROM public.schedule_blocks block JOIN range_days day USING (date)) AS already_blocked,
      (SELECT count(*)::integer FROM public.schedules schedule JOIN range_days day USING (date) WHERE schedule.status = 'pending') AS pending_schedules,
      (SELECT count(*)::integer FROM public.schedules schedule JOIN range_days day USING (date) WHERE schedule.status = 'approved') AS approved_schedules
  ),
  inserted AS (
    INSERT INTO public.schedule_blocks (date, reason, created_by)
    SELECT date, normalized_reason, p_admin_id
    FROM range_days
    ON CONFLICT (date) DO NOTHING
    RETURNING date
  )
  SELECT
    summary.total_days,
    (SELECT count(*)::integer FROM inserted),
    summary.total_days - (SELECT count(*)::integer FROM inserted),
    summary.pending_schedules,
    summary.approved_schedules
  FROM range_summary summary;
END;
$$;

REVOKE ALL ON FUNCTION public.block_schedule_date_range(date, date, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.block_schedule_date_range(date, date, text, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.block_schedule_date_range(date, date, text, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.block_schedule_date_range(date, date, text, uuid) TO service_role;
