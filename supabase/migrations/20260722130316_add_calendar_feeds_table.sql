-- Create calendar_feed_type enum
DO $$ BEGIN
  CREATE TYPE calendar_feed_type AS ENUM ('student', 'training_site', 'aggregate');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create calendar_feeds table
CREATE TABLE IF NOT EXISTS public.calendar_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_type calendar_feed_type NOT NULL,
  entity_id uuid,
  token uuid UNIQUE,
  generated_at timestamptz,
  emailed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint: one feed per entity per type
CREATE UNIQUE INDEX IF NOT EXISTS calendar_feeds_unique_feed_idx
  ON public.calendar_feeds (feed_type, COALESCE(entity_id, '00000000-0000-0000-0000-000000000000'));

-- Enable RLS
ALTER TABLE public.calendar_feeds ENABLE ROW LEVEL SECURITY;

-- Admin full access policy
CREATE POLICY "Admins can manage calendar_feeds"
  ON public.calendar_feeds
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Public read access for active token lookup (needed by the iCal endpoint)
CREATE POLICY "Anyone can read active calendar_feeds for token lookup"
  ON public.calendar_feeds
  FOR SELECT
  TO anon, authenticated
  USING (token IS NOT NULL);
