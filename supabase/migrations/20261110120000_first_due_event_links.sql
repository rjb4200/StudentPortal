-- First Due events sync ledger: one row per scheduled student ride, linking the
-- portal schedule to the First Due event projected for it.

CREATE TABLE IF NOT EXISTS public.first_due_event_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL UNIQUE REFERENCES public.schedules(id) ON DELETE CASCADE,
  token text NOT NULL,
  event_id bigint,
  state text NOT NULL DEFAULT 'planned'
    CHECK (state IN ('planned', 'posted', 'verified', 'cancelled', 'drifted')),
  last_error text,
  posted_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_first_due_event_links_state
  ON public.first_due_event_links (state);

CREATE INDEX IF NOT EXISTS idx_first_due_event_links_event_id
  ON public.first_due_event_links (event_id);

ALTER TABLE public.first_due_event_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read first_due_event_links" ON public.first_due_event_links;
CREATE POLICY "Admins can read first_due_event_links" ON public.first_due_event_links
  FOR SELECT
  TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

CREATE OR REPLACE FUNCTION public.touch_first_due_event_links_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS first_due_event_links_updated_at ON public.first_due_event_links;
CREATE TRIGGER first_due_event_links_updated_at
  BEFORE UPDATE ON public.first_due_event_links
  FOR EACH ROW EXECUTE FUNCTION public.touch_first_due_event_links_updated_at();
