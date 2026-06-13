## Why

Quiz photos and resource documents currently require admins to paste external image or file URLs. There is no way to upload files directly from the admin UI. Supabase Storage is already integrated into the project and supports public buckets with RLS. Adding file upload inputs lets Training staff manage images and documents without external hosting services.

## What Changes

- Create a public Supabase Storage bucket (`onboarding-assets`) with RLS policies: admin write, public read.
- Add a file upload input next to the existing URL field in the quiz photo editor. Successful uploads autofill the `image_url` field.
- Add a file upload input next to the existing URL field in the resource document editor. Successful uploads autofill the `file_url` field.
- Extract reusable upload logic (bucket configuration, MIME type validation, size limits).
- Keep the existing URL-paste path as a fallback for externally hosted files.

## Capabilities

### New Capabilities
- `supabase-storage-file-uploads`: Admin file upload to Supabase Storage for quiz photos and resource documents, with public read access for student-facing components.

### Modified Capabilities
*(None — this adds file upload capability to existing components without changing requirement-level behavior.)*

## Impact

- Supabase Storage: new `onboarding-assets` public bucket with RLS policies.
- Modified: `src/components/admin/quiz-config.tsx` — add file upload to photo editor.
- Modified: `src/components/admin/resource-library-config.tsx` — add file upload to document editor.
- New: `src/lib/supabase/storage.ts` — reusable upload helper.
- No new database tables or migrations.
- No changes to student-facing components (they already read `image_url` / `file_url` from Supabase tables).
