CREATE TABLE IF NOT EXISTS system_job_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'failure')),
  started_at timestamptz NOT NULL,
  finished_at timestamptz NOT NULL,
  duration_ms integer NOT NULL CHECK (duration_ms >= 0),
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_job_runs_job_started_at
  ON system_job_runs (job_name, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_job_runs_job_status_started_at
  ON system_job_runs (job_name, status, started_at DESC);

ALTER TABLE system_job_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read system_job_runs" ON system_job_runs;
CREATE POLICY "Admins can read system_job_runs" ON system_job_runs
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
