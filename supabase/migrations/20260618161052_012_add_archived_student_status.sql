-- Migration 012: Add 'archived' back to student_status enum
-- Fixes type error in cron sweep route referencing 'archived'

alter type public.student_status add value 'archived';
