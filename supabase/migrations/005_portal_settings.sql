-- ============================================================
-- Portal settings key/value table
-- ============================================================

CREATE TABLE portal_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE portal_settings ENABLE ROW LEVEL SECURITY;

-- Public can read all portal settings (anon access for onboarding)
CREATE POLICY "Public can read portal settings"
ON portal_settings
FOR SELECT
USING (true);

-- Admins can manage portal settings
CREATE POLICY "Admins can manage portal settings"
ON portal_settings
FOR ALL
USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)
WITH CHECK (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

-- Seed default help email
INSERT INTO portal_settings (key, value) VALUES ('help_email', 'jbrown@winchesterky.com');
