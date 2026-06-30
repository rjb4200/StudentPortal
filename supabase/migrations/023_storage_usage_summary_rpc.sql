-- Provide a safe public-schema RPC for the system health dashboard to summarize
-- Supabase Storage usage without exposing the reserved storage schema through PostgREST.

CREATE OR REPLACE FUNCTION public.get_storage_usage_summary()
RETURNS TABLE (
  bucket_id text,
  object_count bigint,
  bytes bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, storage
AS $$
  SELECT
    objects.bucket_id::text AS bucket_id,
    COUNT(*)::bigint AS object_count,
    COALESCE(
      SUM(
        CASE
          WHEN objects.metadata->>'size' ~ '^[0-9]+$'
            THEN (objects.metadata->>'size')::bigint
          ELSE 0
        END
      ),
      0
    )::bigint AS bytes
  FROM storage.objects
  GROUP BY objects.bucket_id
  ORDER BY objects.bucket_id;
$$;

REVOKE ALL ON FUNCTION public.get_storage_usage_summary() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_storage_usage_summary() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_storage_usage_summary() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_storage_usage_summary() TO service_role;

COMMENT ON FUNCTION public.get_storage_usage_summary()
  IS 'Aggregates Supabase Storage object counts and byte usage for privileged system health checks.';
