## Why

Two bugs in the legal signature system: (1) per-document acceptances tracked in the UI are never persisted — only a single global signature name is saved, losing which specific documents a student agreed to; (2) `signature_ip` is hardcoded to the string `'client'` and `signature_timestamp` uses the client's system clock, making the audit trail unreliable. Both bugs stem from the `legal-waiver.tsx` component writing directly to Supabase from the client with fake metadata.

## What Changes

- Create a **new database table** `student_legal_acceptances` to record per-document acceptances (student_id, document_id, accepted_at)
- Create a **server-side API route** `POST /api/onboarding/legal-signature` that captures the real client IP from `x-forwarded-for`, uses server time for the timestamp, saves per-document acceptances, and updates the `students` row with the signature
- Modify `legal-waiver.tsx` to call the API route instead of writing directly to Supabase
- Remove the hardcoded `signature_ip: 'client'` placeholder

## Capabilities

### New Capabilities

- `legal-signature-recording`: Server-side legal signature capture with real IP detection, server-accurate timestamps, and per-document acceptance tracking via a new `student_legal_acceptances` junction table.

### Modified Capabilities

- `student-onboarding`: The legal waiver step now records per-document acceptances and uses server-side IP/timestamp instead of client-side placeholders
- `admin-configurable-legal-documents`: Legal document signature now creates per-document acceptance records, enabling future audit views of which students accepted which documents

## Impact

- **1 new table**: `student_legal_acceptances` (migration)
- **1 new API route**: `/api/onboarding/legal-signature/route.ts`
- **1 new migration**: `013_add_student_legal_acceptances.sql`
- **1 modified component**: `legal-waiver.tsx` (API call replaces direct DB write)
- **Regenerated types**: `database.types.ts`
- **No breaking changes**: The `students` table signature columns remain — only their values become real
