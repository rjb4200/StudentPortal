-- Migration 020: Support text-based onboarding quiz questions
-- Adds a per-rule question type and optional text answer content while preserving existing photo-grid rules.

ALTER TABLE public.quiz_rules
  ADD COLUMN IF NOT EXISTS question_type text NOT NULL DEFAULT 'photo_grid';

ALTER TABLE public.quiz_rules
  DROP CONSTRAINT IF EXISTS quiz_rules_question_type_check;

ALTER TABLE public.quiz_rules
  ADD CONSTRAINT quiz_rules_question_type_check
  CHECK (question_type IN ('photo_grid', 'text_choice'));

UPDATE public.quiz_rules
SET question_type = 'photo_grid'
WHERE question_type IS NULL;

ALTER TABLE public.quiz_photos
  ADD COLUMN IF NOT EXISTS option_text text;

ALTER TABLE public.quiz_photos
  ALTER COLUMN image_url DROP NOT NULL;

ALTER TABLE public.quiz_photos
  DROP CONSTRAINT IF EXISTS quiz_photos_answer_content_check;

ALTER TABLE public.quiz_photos
  ADD CONSTRAINT quiz_photos_answer_content_check
  CHECK (
    NULLIF(BTRIM(COALESCE(image_url, '')), '') IS NOT NULL
    OR NULLIF(BTRIM(COALESCE(option_text, '')), '') IS NOT NULL
  );

COMMENT ON COLUMN public.quiz_rules.question_type IS
  'Question renderer type for onboarding quiz rules: photo_grid or text_choice.';

COMMENT ON COLUMN public.quiz_photos.option_text IS
  'Optional text answer content used by text_choice onboarding quiz rules.';
