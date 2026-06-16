-- ============================================================
-- Quiz Flags
-- Tracks students who pass a quiz rule after 3+ failed attempts.
-- Admins acknowledge flags from the Daily Operations dashboard.
-- ============================================================

CREATE TABLE IF NOT EXISTS quiz_flags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  rule_id uuid NOT NULL,
  rule_title text NOT NULL,
  student_name text NOT NULL,
  student_email text NOT NULL,
  attempt_count integer NOT NULL DEFAULT 0,
  acknowledged boolean NOT NULL DEFAULT false,
  acknowledged_by uuid,
  acknowledged_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quiz_flags_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_flags_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT quiz_flags_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES quiz_rules(id) ON DELETE CASCADE,
  CONSTRAINT quiz_flags_acknowledged_by_fkey FOREIGN KEY (acknowledged_by) REFERENCES admin_accounts(id) ON DELETE SET NULL,
  CONSTRAINT quiz_flags_student_rule_unique UNIQUE (student_id, rule_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quiz_flags_unacknowledged
  ON quiz_flags (acknowledged, created_at DESC)
  WHERE acknowledged = false;

CREATE INDEX IF NOT EXISTS idx_quiz_flags_student
  ON quiz_flags (student_id);

-- RLS
ALTER TABLE quiz_flags ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access" ON quiz_flags
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
