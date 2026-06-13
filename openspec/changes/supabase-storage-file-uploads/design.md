## Context

The quiz photo and resource document admin editors currently accept only text URLs (e.g., `https://placehold.co/...` for quiz photos, `/resources/...` paths for documents). The `admin-configurable-onboarding-content` design explicitly named Supabase Storage as the v1 upload path. The project already uses `@supabase/supabase-js` which includes Storage APIs.

## Goals / Non-Goals

**Goals:**
- Allow admins to upload image files for quiz photos directly from the quiz config editor.
- Allow admins to upload document files for resource library documents directly from the resource config editor.
- Autofill the `image_url` / `file_url` field with the public Supabase Storage URL on successful upload.
- Restrict writes to admin users via Storage RLS.
- Allow public reads for student-facing components.

**Non-Goals:**
- Bulk upload or drag-and-drop.
- Image editing, cropping, or resizing on upload.
- Custom domain for Supabase Storage URLs.
- Migration of existing placeholder URLs to Supabase Storage.
- Upload for registration fields, legal documents, or welcome message (text-only configs).

## Decisions

### 1. Single public bucket: `onboarding-assets`

One bucket with folders `/quiz-photos/` and `/resource-docs/` for organization. RLS policy: admin INSERT/UPDATE/DELETE, public SELECT.

**Rationale:** One bucket is simpler to manage than separate buckets per content type. Folders provide logical separation. Public bucket means no signed URLs needed for student views.

**Alternative considered:** Two buckets (`quiz-photos`, `resource-docs`). More granular but doubles RLS configuration and bucket management for no practical benefit.

### 2. File upload via Supabase client SDK, direct from browser

The admin UI uploads files directly to Supabase Storage using `supabase.storage.from('onboarding-assets').upload(...)`. No Next.js API route intermediary.

**Rationale:** The Supabase client already handles auth — the user's admin session JWT is sent with the upload request. RLS on the bucket validates the admin role claim. This avoids adding a new API route and streaming large files through Next.js serverless functions (which have body size limits).

**Alternative considered:** Proxy through a Next.js API route. This would add a server-side validation layer but would hit Vercel serverless function body size limits and add complexity.

### 3. Reusable upload helper in `src/lib/supabase/storage.ts`

Extract bucket name, allowed MIME types (image/* for photos, application/pdf + common doc types for resources), max file size (5MB), and the upload function into a shared module.

**Rationale:** Both quiz-config and resource-library-config need the same upload pattern with different MIME type filters. DRY.

### 4. File input next to existing URL input, not replacing it

Add a `<input type="file">` and "Upload" button next to the existing URL text input. On upload success, populate the URL field. Both inputs remain visible.

**Rationale:** Admins can still paste external URLs for files hosted elsewhere. Upload is an added convenience, not a replacement.

### 5. MIME type validation: images for quiz, documents for resources

Quiz photos: `image/jpeg`, `image/png`, `image/webp`, `image/gif`. Max 5MB.
Resource documents: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`. Max 10MB.

**Rationale:** Quiz photos are displayed in `<img>` tags — image types only. Resource docs are downloads — typical document formats. Limits prevent abuse.

## Risks / Trade-offs

- **[Risk] Free tier storage limit (1GB)** → Mitigation: Quiz photos are small (a few hundred KB each), resource PDFs are typically under 5MB. At ~100 photos + ~20 PDFs, you're well under 1GB. Admin UI shows uploaded file size.
- **[Risk] Public bucket means uploaded files are accessible to anyone who knows the URL** → Mitigation: This is intentional — quiz photos and onboarding resources are educational content, not sensitive data. The bucket contains only public-facing onboarding assets.
- **[Risk] No image optimization on upload** → Mitigation: Future enhancement. V1 accepts files as-is. Supabase Storage can be paired with an image transformation service later.

## Migration Plan

1. Create `onboarding-assets` bucket in Supabase Storage (via dashboard or MCP).
2. Set bucket to public.
3. Apply RLS policy: admin write, public read.
4. Create `src/lib/supabase/storage.ts` helper.
5. Add file upload to quiz photo editor.
6. Add file upload to resource document editor.
7. Run build and verify.

Rollback: Bucket RLS can be tightened or bucket deleted. No database changes to roll back.

## Open Questions

- None.
