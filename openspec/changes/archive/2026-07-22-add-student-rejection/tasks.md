## 1. Database Migration

- [x] 1.1 Create numbered migration SQL in `supabase/migrations/` that adds `rejected` to `student_status` enum and adds `rejection_reason` (TEXT), `rejected_at` (TIMESTAMPTZ), `rejected_by` (TEXT) columns to `students` table
- [x] 1.2 Apply migration to live Supabase project via dashboard SQL editor
- [x] 1.3 Regenerate TypeScript types (`database.types.ts`) to include new enum value and columns

## 2. Email Templates

- [x] 2.1 Add `buildStudentRejectionEmail` template function in `src/lib/email-templates.ts` with subject "WFD EMS Student Portal — Application Declined", student name, reason, and reapply info in WFD-branded layout
- [x] 2.2 Add `buildInstructorRejectionEmail` template function with subject "Student Application Declined — WFD EMS Student Portal", student name, class name, and reason
- [x] 2.3 Add `buildAdminRejectionNotification` template function with subject "Student Rejected — WFD EMS", full student contact info, class details, instructor info, reason, and rejecting admin identity

## 3. Rejection API Route

- [x] 3.1 Create `src/app/api/admin/reject-student/route.ts` with POST handler that authenticates admin, validates student is pending with completed onboarding and non-empty reason, deletes auth user, updates student to rejected with metadata, and sends three non-blocking emails
- [x] 3.2 Create `src/app/api/admin/reject-student/route.test.ts` with Vitest tests covering: successful rejection, missing reason, non-admin access, non-pending student, incomplete onboarding, auth user delete failure, and email delivery failure

## 4. UI — Rejection Button and Confirmation Dialog

- [x] 4.1 Add Reject button next to the existing Approve button in the pending students list of `src/components/admin/daily-ops.tsx` (Action Required section)
- [x] 4.2 Implement rejection confirmation dialog with required reason textarea, disabled confirm button when reason is empty, and loading state while API call is in progress
- [x] 4.3 Add rejection error state display (using existing `Alert` component pattern)
- [x] 4.4 Refresh the pending students list on successful rejection

## 5. Verification

- [x] 5.1 Run `npm run test` to verify all existing and new tests pass
- [x] 5.2 Run `npm run build` to verify the project compiles cleanly
- [x] 5.3 Manually verify: reject a test student in DailyOps, confirm auth user is deleted in Supabase dashboard, confirm student status is `rejected` with metadata, verify all three emails are received
- [x] 5.4 Verify rejected student cannot access `/dashboard` (middleware redirects to login)
- [x] 5.5 Verify rejected student can register a new application using the same email
