-- Secure onboarding completion with server-verified session proof.
-- Run this in the Supabase SQL Editor for project ejjsahtohaydoogtilgp.

CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT onboarding_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT onboarding_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_student ON onboarding_sessions (student_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_onboarding_sessions_token_hash ON onboarding_sessions (token_hash);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_active ON onboarding_sessions (student_id, expires_at) WHERE completed_at IS NULL;

ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies are intentionally created. The table is server-owned;
-- completion proof is verified through service-role API routes, not direct Data API access.
