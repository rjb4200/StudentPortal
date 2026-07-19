-- Revoke Data API exposure of PostgREST internal schema refresh function.
-- PostgREST calls this internally via NOTIFY pgrst with its own role;
-- the PUBLIC grant surfaces this function through /rest/v1/rpc/ unnecessarily.
-- Following the pattern in restrict_schedule_block_function_access.sql:
-- revoke from PUBLIC (covers anon + authenticated), then grant back to service_role only.
REVOKE ALL ON FUNCTION public.refresh_pgrst_schema() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refresh_pgrst_schema() FROM anon;
REVOKE ALL ON FUNCTION public.refresh_pgrst_schema() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_pgrst_schema() TO service_role;
