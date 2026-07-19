-- Migration 023: Enable RLS on student_legal_acceptances
-- This table had RLS disabled, leaving it exposed to PostgREST anon/authenticated queries.
-- All writes go through /api/onboarding/legal-signature (admin client, service role — bypasses RLS).
-- No client-side reads exist, so default-deny with no policies is correct.
ALTER TABLE public.student_legal_acceptances ENABLE ROW LEVEL SECURITY;
