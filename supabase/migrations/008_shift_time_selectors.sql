-- 008_shift_time_selectors
-- Add start/end time columns to schedules and extend shift_type enum with 'custom'

ALTER TYPE shift_type ADD VALUE IF NOT EXISTS 'custom';

ALTER TABLE schedules
  ADD COLUMN IF NOT EXISTS start_time text,
  ADD COLUMN IF NOT EXISTS end_time text;
