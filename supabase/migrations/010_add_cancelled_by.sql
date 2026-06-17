-- Add cancelled_by column to schedules table to track who initiated a cancellation
ALTER TABLE schedules ADD COLUMN cancelled_by TEXT;
