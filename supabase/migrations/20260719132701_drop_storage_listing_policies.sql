-- Remove broad SELECT policies that allow public enumeration of storage bucket files.
-- Direct URL access to individual files continues to work without these policies.
DROP POLICY IF EXISTS "Public can read branding" ON storage.objects;
DROP POLICY IF EXISTS "Public can read onboarding assets" ON storage.objects;
