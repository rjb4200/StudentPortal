-- Migration 022: Scope instructors to exactly one TEI
-- Enforces TEI-scoped instructor identity and class/instructor site consistency.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.instructors
    WHERE training_site_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot scope instructors to a single TEI while instructors without a TEI exist.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.instructors
    GROUP BY training_site_id, lower(email)
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot add TEI-scoped instructor email uniqueness while same-TEI duplicate instructor emails exist.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.training_classes
    JOIN public.instructors ON instructors.id = training_classes.instructor_id
    WHERE instructors.training_site_id IS DISTINCT FROM training_classes.training_site_id
  ) THEN
    RAISE EXCEPTION 'Cannot enforce class/instructor TEI consistency while mismatched classes exist.';
  END IF;
END $$;

ALTER TABLE public.instructors
  DROP CONSTRAINT IF EXISTS instructors_training_site_id_fkey;

ALTER TABLE public.instructors
  ALTER COLUMN training_site_id SET NOT NULL;

ALTER TABLE public.instructors
  ADD CONSTRAINT instructors_training_site_id_fkey
  FOREIGN KEY (training_site_id)
  REFERENCES public.training_sites(id)
  ON DELETE RESTRICT;

CREATE UNIQUE INDEX IF NOT EXISTS instructors_training_site_email_lower_key
  ON public.instructors (training_site_id, lower(email));

CREATE INDEX IF NOT EXISTS idx_instructors_training_site_name
  ON public.instructors (training_site_id, lower(last_name), lower(first_name));

CREATE OR REPLACE FUNCTION public.enforce_training_class_instructor_site_scope()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  instructor_site_id uuid;
BEGIN
  SELECT instructors.training_site_id
  INTO instructor_site_id
  FROM public.instructors
  WHERE instructors.id = NEW.instructor_id;

  IF instructor_site_id IS NULL THEN
    RAISE EXCEPTION 'Selected instructor was not found or is not assigned to a TEI.'
      USING ERRCODE = '23503';
  END IF;

  IF instructor_site_id <> NEW.training_site_id THEN
    RAISE EXCEPTION 'Selected instructor does not belong to the selected training site.'
      USING ERRCODE = '23503';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_training_class_instructor_site_scope() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_training_class_instructor_site_scope() FROM anon;
REVOKE EXECUTE ON FUNCTION public.enforce_training_class_instructor_site_scope() FROM authenticated;

DROP TRIGGER IF EXISTS enforce_training_class_instructor_site_scope ON public.training_classes;
CREATE TRIGGER enforce_training_class_instructor_site_scope
  BEFORE INSERT OR UPDATE OF training_site_id, instructor_id ON public.training_classes
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_training_class_instructor_site_scope();

COMMENT ON COLUMN public.instructors.training_site_id IS 'Required TEI owning this instructor record; duplicate people across TEIs use separate instructor rows.';
COMMENT ON INDEX public.instructors_training_site_email_lower_key IS 'Prevents duplicate instructor emails within a single TEI while allowing duplicate emails across TEIs.';
