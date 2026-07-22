## Why

Admins can currently only approve or delete pending student applications. There is no way to formally decline a student who does not meet requirements, leaving rejected applicants in limbo and the approval queue cluttered. A rejection flow with required reasoning and transparent multi-party notification gives admins a clear denial path, keeps rejected records for audit, and ensures the student and their instructor understand why the application was declined.

## What Changes

- Add `rejected` to the `student_status` enum and new `rejection_reason`, `rejected_at`, `rejected_by` columns to the `students` table
- New `POST /api/admin/reject-student` API route that validates the student is pending with completed onboarding, deletes the associated Supabase Auth user, sets status to `rejected`, and stores the rejection metadata
- Reject button in the DailyOps "Action Required" queue next to the existing Approve button, gated by a confirmation dialog requiring a rejection reason
- Three non-blocking notification emails on rejection: one to the student (with reason), one to the class instructor (with reason), and one to admins (with full contact info, class details, rejection metadata, and the reason)
- Rejected students are blocked from dashboard access via the existing middleware catch-all; they may reapply with the same email since the unique index covers only `pending` and `certified` statuses

## Capabilities

### New Capabilities
- `student-rejection`: Server-side rejection API, UI confirmation with required reason, multi-party email notification, and audit trail for formally declining pending student applications

### Modified Capabilities
- `student-email-notifications`: Adds three new transactional email types for student rejection notifications (student-facing, instructor-facing, and admin-facing)

## Impact

- **Database**: `student_status` enum gains `rejected` value; `students` table gains `rejection_reason` (TEXT), `rejected_at` (TIMESTAMPTZ), `rejected_by` (TEXT)
- **API**: New `src/app/api/admin/reject-student/route.ts`
- **UI**: `src/components/admin/daily-ops.tsx` — new Reject button beside Approve, new confirmation dialog with required reason textarea
- **Email templates**: `src/lib/email-templates.ts` — three new template functions
- **Types**: `src/lib/supabase/database.types.ts` — updated `student_status` enum and new column types
- **Middleware**: No change required (catch-all at line 74 already handles any non-`certified`/non-`pending` status)
- **RLS**: No change — rejection writes use admin client (service role bypass)
