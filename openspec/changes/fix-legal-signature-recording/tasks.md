## 1. Migration — Student Legal Acceptances Table

- [x] 1.1 Create migration SQL for `student_legal_acceptances` table with `id` (uuid PK), `student_id` (FK → students CASCADE), `document_id` (FK → legal_documents CASCADE), `accepted_at` (timestamptz), and `UNIQUE(student_id, document_id)` constraint
- [x] 1.2 Apply migration via supabase_apply_migration
- [x] 1.3 Run supabase_generate_typescript_types and replace database.types.ts

## 2. API Route — Server-Side Signature Capture

- [x] 2.1 Create `src/app/api/onboarding/legal-signature/route.ts` with `POST` handler that accepts `{ studentId, fullName, agreedDocumentIds }`, extracts real IP from `x-forwarded-for` or `x-real-ip` headers (fallback `'0.0.0.0'`), uses server-side `new Date().toISOString()` for timestamp, inserts per-document acceptance rows into `student_legal_acceptances`, and updates `students` row with `legal_signature`, `signature_ip`, `signature_timestamp`

## 3. Client — legal-waiver.tsx

- [x] 3.1 Modify `legal-waiver.tsx` to call `POST /api/onboarding/legal-signature` with `{ studentId, fullName, agreedDocumentIds }` instead of directly updating the `students` table via client-side Supabase
- [x] 3.2 Remove the hardcoded `signature_ip: 'client'` placeholder

## 4. Verification

- [x] 4.1 Run `npm run build` to verify no compilation errors
- [x] 4.2 Manually verify: complete onboarding legal step, confirm `student_legal_acceptances` has rows, confirm `signature_ip` is a real IP (not `'client'`)
