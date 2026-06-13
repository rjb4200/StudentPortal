-- ============================================================
-- Admin-Configurable Onboarding Content
-- registration_fields, legal_documents, resource_categories,
-- resource_documents, message_templates, broadcasts, welcome
-- ============================================================

-- 1. REGISTRATION FIELDS
CREATE TABLE IF NOT EXISTS registration_fields (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  field_key text NOT NULL,
  label text NOT NULL,
  field_type text NOT NULL DEFAULT 'text',
  is_required boolean NOT NULL DEFAULT false,
  placeholder text,
  options text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_permanent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT registration_fields_pkey PRIMARY KEY (id),
  CONSTRAINT registration_fields_field_key_key UNIQUE (field_key)
);

CREATE TABLE IF NOT EXISTS student_field_values (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  field_id uuid NOT NULL,
  value text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_field_values_pkey PRIMARY KEY (id),
  CONSTRAINT student_field_values_student_field_key UNIQUE (student_id, field_id),
  CONSTRAINT student_field_values_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT student_field_values_field_id_fkey FOREIGN KEY (field_id) REFERENCES registration_fields(id) ON DELETE CASCADE
);

-- 2. LEGAL DOCUMENTS
CREATE TABLE IF NOT EXISTS legal_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body_text text NOT NULL,
  require_checkbox boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT legal_documents_pkey PRIMARY KEY (id)
);

-- 3. RESOURCE LIBRARY
CREATE TABLE IF NOT EXISTS resource_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT resource_categories_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS resource_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL,
  name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL DEFAULT 'PDF',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT resource_documents_pkey PRIMARY KEY (id),
  CONSTRAINT resource_documents_category_id_fkey FOREIGN KEY (category_id) REFERENCES resource_categories(id) ON DELETE CASCADE
);

-- 4. MESSAGING
CREATE TABLE IF NOT EXISTS message_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  template_type text NOT NULL DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT message_templates_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS broadcasts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  sent_by text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  recipient_count integer NOT NULL DEFAULT 0,
  CONSTRAINT broadcasts_pkey PRIMARY KEY (id)
);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS broadcast_id uuid REFERENCES broadcasts(id) ON DELETE SET NULL;

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_registration_fields_active_order ON registration_fields (is_active, sort_order, created_at);
CREATE INDEX IF NOT EXISTS idx_student_field_values_student ON student_field_values (student_id);
CREATE INDEX IF NOT EXISTS idx_legal_documents_active_order ON legal_documents (is_active, sort_order, created_at);
CREATE INDEX IF NOT EXISTS idx_resource_categories_active_order ON resource_categories (is_active, sort_order, created_at);
CREATE INDEX IF NOT EXISTS idx_resource_documents_category_active ON resource_documents (category_id, is_active, sort_order, created_at);
CREATE INDEX IF NOT EXISTS idx_message_templates_active ON message_templates (is_active, template_type);
CREATE INDEX IF NOT EXISTS idx_broadcasts_sent_at ON broadcasts (sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_broadcast ON messages (broadcast_id);

-- 6. RLS
ALTER TABLE registration_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

-- Public reads active onboarding content
CREATE POLICY "Public can read active registration fields" ON registration_fields
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active legal documents" ON legal_documents
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active resource categories" ON resource_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active resource documents" ON resource_documents
  FOR SELECT USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM resource_categories
      WHERE resource_categories.id = resource_documents.category_id
        AND resource_categories.is_active = true
    )
  );

-- Admin full access for all new tables
CREATE POLICY "Admins can manage registration fields" ON registration_fields
  FOR ALL
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)
  WITH CHECK (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Admins can manage legal documents" ON legal_documents
  FOR ALL
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)
  WITH CHECK (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Admins can manage resource categories" ON resource_categories
  FOR ALL
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)
  WITH CHECK (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Admins can manage resource documents" ON resource_documents
  FOR ALL
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)
  WITH CHECK (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Admins can manage templates" ON message_templates
  FOR ALL
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)
  WITH CHECK (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Admins can manage broadcasts" ON broadcasts
  FOR ALL
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)
  WITH CHECK (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

-- Students can read their own field values
CREATE POLICY "Students can read own field values" ON student_field_values
  FOR SELECT USING (auth.uid() = student_id);

-- Students can read broadcasts (through messages table)
-- No separate policy needed; messages table policies already handle this.

-- Authenticated users can read active templates
CREATE POLICY "Authenticated users can read active templates" ON message_templates
  FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

-- 7. SEED DATA

-- Default registration fields matching current form
INSERT INTO registration_fields (field_key, label, field_type, is_required, placeholder, sort_order, is_active, is_permanent)
VALUES
  ('full_name', 'Full Name', 'text', true, NULL, 10, true, true),
  ('email', 'Email', 'email', true, NULL, 20, true, true),
  ('phone', 'Phone', 'tel', false, NULL, 30, true, false),
  ('school_name', 'School / Program', 'text', true, NULL, 40, true, false),
  ('instructor_name', 'Instructor Name', 'text', true, NULL, 50, true, false),
  ('instructor_contact', 'Instructor Contact (email or phone)', 'text', true, NULL, 60, true, false)
ON CONFLICT (field_key) DO NOTHING;

-- Default legal documents
INSERT INTO legal_documents (title, body_text, require_checkbox, sort_order, is_active)
VALUES
  (
    'HIPAA & Confidentiality Agreement',
    'As a student participating in clinical rotations with the Winchester Fire Department (WFD) Division of EMS, you may have access to Protected Health Information (PHI) and other confidential patient data. By signing below, you acknowledge and agree to the following:\n\n1. All patient information encountered during your rotation is strictly confidential.\n2. You will not disclose, copy, or remove any patient information from WFD facilities.\n3. You will comply with all HIPAA regulations and WFD privacy policies.\n4. Any breach of confidentiality may result in immediate termination of your rotation and potential legal action.\n5. This obligation extends beyond the duration of your rotation.',
    true,
    10,
    true
  ),
  (
    'Liability Waiver and Release',
    'In consideration of being permitted to participate in clinical rotations with the Winchester Fire Department Division of EMS, I hereby:\n\n1. Acknowledge the inherent risks associated with emergency medical services and fire department operations.\n2. Assume full responsibility for any personal injury or property damage that may occur during my rotation.\n3. Release and discharge the Winchester Fire Department, its officers, employees, and agents from any and all claims arising from my participation.\n4. Agree to follow all safety protocols, policies, and directives from WFD personnel.\n5. Certify that I am covered by my educational institution''s liability insurance.',
    true,
    20,
    true
  );

-- Default resource categories and documents
WITH cat_station AS (
  INSERT INTO resource_categories (name, sort_order, is_active) VALUES ('Station Maps', 10, true) RETURNING id
),
cat_sog AS (
  INSERT INTO resource_categories (name, sort_order, is_active) VALUES ('Departmental SOGs', 20, true) RETURNING id
)
INSERT INTO resource_documents (category_id, name, file_url, file_type, sort_order, is_active)
SELECT cat_station.id, doc.name, doc.file_url, 'PDF', doc.sort_order, true
FROM cat_station
CROSS JOIN LATERAL (
  VALUES
    ('Station 1 - Downtown HQ Map', '/resources/station-1-map.pdf', 10),
    ('Station 2 - West Side Map', '/resources/station-2-map.pdf', 20),
    ('Station 3 - Industrial Map', '/resources/station-3-map.pdf', 30)
) AS doc(name, file_url, sort_order)
UNION ALL
SELECT cat_sog.id, doc.name, doc.file_url, 'PDF', doc.sort_order, true
FROM cat_sog
CROSS JOIN LATERAL (
  VALUES
    ('EMS Operations SOG', '/resources/ems-operations-sog.pdf', 10),
    ('Infection Control SOG', '/resources/infection-control-sog.pdf', 20),
    ('Patient Care Reporting SOG', '/resources/patient-care-sog.pdf', 30),
    ('Safety & PPE SOG', '/resources/safety-ppe-sog.pdf', 40)
) AS doc(name, file_url, sort_order);

-- Default welcome template
INSERT INTO message_templates (title, body, template_type, is_active)
VALUES (
  'Welcome to WFD EMS Student Portal',
  'Welcome to the Winchester Fire Department EMS Student Portal! Your onboarding has been received and is pending administrative review. You will be notified once your registration has been approved. In the meantime, you can review the resource library materials from your dashboard.',
  'welcome',
  true
);
