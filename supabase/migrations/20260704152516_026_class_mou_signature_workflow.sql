-- Migration 026: Class MOU electronic signature workflow
-- Adds class_mous table, admin notification preference, and default MOU settings.

CREATE TABLE IF NOT EXISTS public.class_mous (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  training_class_id uuid NOT NULL,
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  training_organization_name text NOT NULL DEFAULT '',
  representative_name text NOT NULL DEFAULT '',
  representative_title text NOT NULL DEFAULT '',
  representative_signature text NOT NULL DEFAULT '',
  representative_signed_at timestamptz NOT NULL DEFAULT now(),
  mou_body_snapshot text NOT NULL DEFAULT '',
  wfems_signer_name text,
  wfems_signer_title text,
  wfems_signed_at timestamptz,
  pdf_generated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT class_mous_pkey PRIMARY KEY (id),
  CONSTRAINT class_mous_training_class_id_unique UNIQUE (training_class_id),
  CONSTRAINT class_mous_training_class_id_fkey FOREIGN KEY (training_class_id)
    REFERENCES public.training_classes(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_class_mous_training_class ON public.class_mous (training_class_id);
CREATE INDEX IF NOT EXISTS idx_class_mous_wfems_signed ON public.class_mous (wfems_signed_at) WHERE wfems_signed_at IS NULL;

ALTER TABLE public.class_mous ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage class mous" ON public.class_mous;

CREATE POLICY "Admins can manage class mous" ON public.class_mous
  FOR ALL
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)
  WITH CHECK (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text);

ALTER TABLE public.admin_accounts
  ADD COLUMN IF NOT EXISTS notify_class_mou boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.admin_accounts.notify_class_mou IS 'When true, admin receives completed class MOU PDF emails.';

INSERT INTO public.portal_settings (key, value)
VALUES
  ('mou_template_body', 'This Memorandum of Understanding ("MOU") is entered into by and between Winchester Fire/EMS, hereinafter referred to as "WFEMS," and {{training_organization_name}}, hereinafter referred to as "Training Organization," effective as of {{effective_date}}.

1. PURPOSE. The purpose of this MOU is to establish the terms and conditions under which students enrolled in the Training Organization''s EMS training program, specifically the {{class_name}} class ({{class_start_date}} to {{ride_time_end_date}}), may participate in clinical ride-time rotations with WFEMS.

2. TRAINING ORGANIZATION RESPONSIBILITIES. The Training Organization agrees to:
   a. Ensure all students have completed required prerequisite training before participating in ride-time rotations.
   b. Provide WFEMS with a roster of participating students.
   c. Ensure students comply with WFEMS policies, procedures, and standards of conduct during ride-time rotations.
   d. Maintain appropriate liability insurance coverage for students during ride-time rotations.
   e. Designate a clinical coordinator or instructor as the primary point of contact for WFEMS.

3. WFEMS RESPONSIBILITIES. WFEMS agrees to:
   a. Provide clinical ride-time opportunities for qualified students during the approved class window.
   b. Assign preceptors to supervise students during ride-time rotations.
   c. Provide access to necessary safety equipment and orientation to WFEMS facilities and apparatus.
   d. Communicate any concerns regarding student performance or conduct to the Training Organization''s designated contact.
   e. Maintain appropriate liability insurance coverage for operations.

4. TERM. This MOU shall become effective on {{effective_date}} and shall remain in effect for the duration of the {{class_name}} class, specifically from {{class_start_date}} through {{ride_time_end_date}}, unless terminated earlier by mutual agreement of both parties.

5. GENERAL PROVISIONS.
   a. This MOU may be modified only by written agreement signed by both parties.
   b. This MOU shall be governed by and construed in accordance with the laws of the Commonwealth of Kentucky.
   c. Nothing in this MOU creates an employment relationship between WFEMS and the Training Organization''s students or instructors.

IN WITNESS WHEREOF, the parties have executed this MOU as of the date(s) set forth below.

Training Organization Representative:

_________________________________________
{{representative_name}}, {{representative_title}}
Date: {{representative_signed_at}}

Winchester Fire/EMS:

_________________________________________
{{wfems_signer_name}}, {{wfems_signer_title}}
Date: {{wfems_signed_at}}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.portal_settings (key, value)
VALUES
  ('mou_wfems_signer_name', 'James Brown'),
  ('mou_wfems_signer_title', 'EMS Major'),
  ('mou_wfems_signer_organization', 'Winchester Fire/EMS')
ON CONFLICT (key) DO NOTHING;
