REVOKE ALL ON FUNCTION public.resolve_schedule_and_block_day(uuid, public.schedule_status, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.resolve_schedule_and_block_day(uuid, public.schedule_status, text, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.resolve_schedule_and_block_day(uuid, public.schedule_status, text, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_schedule_and_block_day(uuid, public.schedule_status, text, uuid) TO service_role;
