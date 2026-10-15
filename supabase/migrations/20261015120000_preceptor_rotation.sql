-- Preceptor rotation: assign a preceptor to a crew shift; pair a preceptor to a
-- student shift at approval, with at most one student per preceptor per day.

DO $$ BEGIN
  CREATE TYPE public.preceptor_shift AS ENUM ('first', 'second', 'third');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.preceptors
  ADD COLUMN IF NOT EXISTS shift public.preceptor_shift;

ALTER TABLE public.schedules
  ADD COLUMN IF NOT EXISTS preceptor_id uuid REFERENCES public.preceptors(id) ON DELETE SET NULL;

-- One student per preceptor per day.
CREATE UNIQUE INDEX IF NOT EXISTS schedules_preceptor_date_key
  ON public.schedules (preceptor_id, date)
  WHERE preceptor_id IS NOT NULL;
