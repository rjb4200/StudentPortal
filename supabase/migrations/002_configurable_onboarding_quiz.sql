-- ============================================================
-- Configurable Onboarding Quiz
-- Adds admin-managed quiz rules/photos for the knowledge gate.
-- ============================================================

CREATE TABLE IF NOT EXISTS quiz_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  rule_text text NOT NULL,
  instruction text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quiz_rules_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS quiz_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL,
  label text NOT NULL,
  image_url text NOT NULL,
  is_non_compliant boolean NOT NULL DEFAULT false,
  reason text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quiz_photos_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_photos_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES quiz_rules(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quiz_rules_active_order ON quiz_rules (is_active, sort_order, created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_photos_rule_active_order ON quiz_photos (rule_id, is_active, sort_order, created_at);

ALTER TABLE quiz_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active quiz rules" ON quiz_rules
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage quiz rules" ON quiz_rules
  FOR ALL
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)
  WITH CHECK (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Public can read active quiz photos" ON quiz_photos
  FOR SELECT USING (
    is_active = true
    AND EXISTS (
      SELECT 1
      FROM quiz_rules
      WHERE quiz_rules.id = quiz_photos.rule_id
        AND quiz_rules.is_active = true
    )
  );

CREATE POLICY "Admins can manage quiz photos" ON quiz_photos
  FOR ALL
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)
  WITH CHECK (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

WITH inserted_rules AS (
  INSERT INTO quiz_rules (title, rule_text, instruction, sort_order, is_active)
  VALUES
    (
      'Hair and Grooming Standards',
      'Hair must be clean, controlled, and secured so it does not interfere with PPE, patient care, or scene safety. Facial hair must not prevent an N95 or respirator seal. Students must present a professional appearance while operating in WFD spaces.',
      'Select every photo that is not in compliance with the hair and grooming standard.',
      10,
      true
    ),
    (
      'PPE Readiness',
      'Students must use the PPE required for the environment and task. Gloves are required for patient contact, eye protection is required when splash risk exists, and respiratory protection must be worn when airborne precautions are indicated.',
      'Select every photo that is not in compliance with the PPE readiness rule.',
      20,
      true
    ),
    (
      'Station Conduct and Scene Awareness',
      'Students must keep station and scene areas clear, professional, and ready for response. Personal items may not block walkways, bay paths, equipment access, or emergency exits. Students must remain alert and follow preceptor direction.',
      'Select every photo that is not in compliance with station conduct expectations.',
      30,
      true
    )
  RETURNING id, title
)
INSERT INTO quiz_photos (rule_id, label, image_url, is_non_compliant, reason, sort_order, is_active)
SELECT inserted_rules.id, photo.label, photo.image_url, photo.is_non_compliant, photo.reason, photo.sort_order, true
FROM inserted_rules
JOIN LATERAL (
  VALUES
    ('Hair and Grooming Standards', 'Loose long hair near patient care area', 'https://placehold.co/420x320/9b1c1f/white?text=Loose+Hair', true, 'Long hair is unsecured and could interfere with PPE or patient care.', 10),
    ('Hair and Grooming Standards', 'Hair secured above collar', 'https://placehold.co/420x320/1f7a3f/white?text=Hair+Secured', false, 'Hair is secured and does not interfere with PPE.', 20),
    ('Hair and Grooming Standards', 'Beard interfering with respirator seal', 'https://placehold.co/420x320/9b1c1f/white?text=Seal+Obstruction', true, 'Facial hair prevents a proper respirator seal.', 30),
    ('Hair and Grooming Standards', 'Clean-shaven respirator seal area', 'https://placehold.co/420x320/1f7a3f/white?text=Seal+Clear', false, 'The respirator seal area is clear.', 40),
    ('Hair and Grooming Standards', 'Distracting loose accessories', 'https://placehold.co/420x320/9b1c1f/white?text=Loose+Accessories', true, 'Loose accessories create a snag and contamination risk.', 50),
    ('PPE Readiness', 'Patient contact without gloves', 'https://placehold.co/420x320/9b1c1f/white?text=No+Gloves', true, 'Gloves are required during patient contact.', 10),
    ('PPE Readiness', 'Gloves and eye protection in place', 'https://placehold.co/420x320/1f7a3f/white?text=Proper+PPE', false, 'Required PPE is in use.', 20),
    ('PPE Readiness', 'Mask below nose', 'https://placehold.co/420x320/9b1c1f/white?text=Mask+Below+Nose', true, 'Respiratory protection must cover both mouth and nose.', 30),
    ('PPE Readiness', 'Splash task without eye protection', 'https://placehold.co/420x320/9b1c1f/white?text=No+Eye+Protection', true, 'Eye protection is required when splash risk exists.', 40),
    ('PPE Readiness', 'Respirator sealed correctly', 'https://placehold.co/420x320/1f7a3f/white?text=Respirator+Sealed', false, 'Respiratory protection is worn correctly.', 50),
    ('Station Conduct and Scene Awareness', 'Bag blocking bay walkway', 'https://placehold.co/420x320/9b1c1f/white?text=Blocked+Walkway', true, 'Personal items cannot block walkways or response paths.', 10),
    ('Station Conduct and Scene Awareness', 'Gear staged in assigned area', 'https://placehold.co/420x320/1f7a3f/white?text=Gear+Staged', false, 'Gear is staged without blocking access.', 20),
    ('Station Conduct and Scene Awareness', 'Exit partially blocked', 'https://placehold.co/420x320/9b1c1f/white?text=Blocked+Exit', true, 'Emergency exits must remain unobstructed.', 30),
    ('Station Conduct and Scene Awareness', 'Equipment cabinet clear', 'https://placehold.co/420x320/1f7a3f/white?text=Access+Clear', false, 'Equipment access remains clear.', 40),
    ('Station Conduct and Scene Awareness', 'Student distracted during patient movement', 'https://placehold.co/420x320/9b1c1f/white?text=Distracted+Student', true, 'Students must remain alert during patient movement and scene activity.', 50),
    ('Station Conduct and Scene Awareness', 'Student following preceptor direction', 'https://placehold.co/420x320/1f7a3f/white?text=Following+Direction', false, 'Student is attentive and following direction.', 60)
) AS photo(rule_title, label, image_url, is_non_compliant, reason, sort_order)
  ON photo.rule_title = inserted_rules.title;
