UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', raw_user_meta_data ->> 'role')
WHERE raw_app_meta_data ->> 'role' IS NULL
  AND raw_user_meta_data ->> 'role' IN ('admin', 'preceptor', 'student');

DO $$
DECLARE
  policy_row record;
  using_clause text;
  check_clause text;
BEGIN
  FOR policy_row IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        qual LIKE '%user_metadata%'
        OR with_check LIKE '%user_metadata%'
      )
  LOOP
    using_clause := CASE
      WHEN policy_row.qual IS NULL THEN ''
      ELSE ' USING (' || replace(policy_row.qual, 'user_metadata', 'app_metadata') || ')'
    END;

    check_clause := CASE
      WHEN policy_row.with_check IS NULL THEN ''
      ELSE ' WITH CHECK (' || replace(policy_row.with_check, 'user_metadata', 'app_metadata') || ')'
    END;

    EXECUTE format(
      'ALTER POLICY %I ON %I.%I%s%s',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename,
      using_clause,
      check_clause
    );
  END LOOP;
END $$;
