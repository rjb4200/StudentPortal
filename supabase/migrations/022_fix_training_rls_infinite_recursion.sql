-- Migration 022: Fix infinite recursion in training_* RLS policies
-- The public-read policies on training_sites, instructors, and training_classes
-- had cross-table EXISTS checks that caused circular RLS evaluation:
--   training_sites -> training_classes -> instructors -> training_sites (∞)
-- This migration simplifies each policy to only check its own row's status.

-- 1. Fix admin user role (should be 'admin' not 'student')
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"admin"')
WHERE email = 'rjb4200@gmail.com';

-- 2. Replace public-read policies on training_sites
DROP POLICY IF EXISTS "Public can read active visible training sites" ON public.training_sites;
CREATE POLICY "Public can read active training sites" ON public.training_sites
  FOR SELECT TO anon, authenticated
  USING (status = 'active'::public.registry_status);

-- 3. Replace public-read policies on instructors
DROP POLICY IF EXISTS "Public can read active visible instructors" ON public.instructors;
CREATE POLICY "Public can read active instructors" ON public.instructors
  FOR SELECT TO anon, authenticated
  USING (status = 'active'::public.registry_status);

-- 4. Replace public-read policies on training_classes
DROP POLICY IF EXISTS "Public can read active visible training classes" ON public.training_classes;
CREATE POLICY "Public can read active training classes" ON public.training_classes
  FOR SELECT TO anon, authenticated
  USING (
    status = 'active'::public.registry_status
    AND (timezone('America/New_York', now()))::date >= class_start_date
    AND (timezone('America/New_York', now()))::date <= ride_time_end_date
  );
