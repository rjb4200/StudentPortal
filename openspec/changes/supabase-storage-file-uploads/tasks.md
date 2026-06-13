## 1. Supabase Storage Setup

- [x] 1.1 Create public bucket `onboarding-assets` in Supabase Storage
- [x] 1.2 Apply RLS policy: admin INSERT/UPDATE/DELETE, public SELECT
- [x] 1.3 Create `src/lib/supabase/storage.ts` helper with bucket name, MIME types, max sizes, upload function

## 2. Quiz Photo File Upload

- [x] 2.1 Add file input and upload button next to existing URL field in quiz photo editor
- [x] 2.2 On file select, upload to `onboarding-assets/quiz-photos/` via storage helper
- [x] 2.3 Autofill `image_url` field with public URL on success
- [x] 2.4 Show loading state during upload and error message on failure
- [x] 2.5 Validate file type (image/*) and size (5MB max) before upload

## 3. Resource Document File Upload

- [x] 3.1 Add file input and upload button next to existing URL field in resource document editor
- [x] 3.2 On file select, upload to `onboarding-assets/resource-docs/` via storage helper
- [x] 3.3 Autofill `file_url` field with public URL on success
- [x] 3.4 Show loading state during upload and error message on failure
- [x] 3.5 Validate file type (pdf, doc, docx, txt) and size (10MB max) before upload

## 4. Verification

- [x] 4.1 Verify admin can upload a quiz photo and the public URL is accessible
- [x] 4.2 Verify admin can upload a resource document and the public URL is accessible
- [x] 4.3 Verify student-facing components render uploaded quiz photos
- [x] 4.4 Verify student-facing components link to uploaded resource documents
- [x] 4.5 Verify non-admin users cannot upload files
- [x] 4.6 Verify existing URL-paste path still works for both components
- [x] 4.7 Run production build and resolve any issues
