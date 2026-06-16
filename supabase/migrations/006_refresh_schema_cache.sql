-- Refresh PostgREST schema cache to pick up auth_user_id column
COMMENT ON COLUMN students.auth_user_id IS 'Supabase Auth user ID, linked on onboarding completion';

CREATE OR REPLACE FUNCTION public.refresh_pgrst_schema() RETURNS void AS $$
BEGIN
  NOTIFY pgrst, 'reload schema';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
