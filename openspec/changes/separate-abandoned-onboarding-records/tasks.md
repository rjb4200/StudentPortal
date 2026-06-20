## 1. Database Lifecycle Marker

- [x] 1.1 Create a Supabase migration adding nullable `students.onboarding_completed_at timestamptz`.
- [x] 1.2 Backfill `onboarding_completed_at` for existing `certified`, `expired`, and `archived` students.
- [x] 1.3 Backfill `onboarding_completed_at` for existing `pending` students where `auth_user_id IS NOT NULL`.
- [x] 1.4 Add an index supporting pending approval and abandoned-registration queries.
- [x] 1.5 Apply the migration to the live Supabase project.
- [x] 1.6 Regenerate and update `src/lib/supabase/database.types.ts`.

## 2. Onboarding Completion

- [x] 2.1 Update `/api/notify/onboarding-complete` to set `onboarding_completed_at` when auth setup/linking succeeds.
- [x] 2.2 Ensure auth creation/linking failures leave `onboarding_completed_at` null.
- [x] 2.3 Update dashboard/login eligibility checks if needed so incomplete pending records are not treated as pending-review dashboard users.

## 3. Daily Ops Filtering

- [x] 3.1 Update Action Required approval query to use `status = 'pending'` and `onboarding_completed_at IS NOT NULL`.
- [x] 3.2 Update Daily Ops Student Roster query/filter to show certified students only.
- [x] 3.3 Confirm pending students no longer appear in the Student Roster, regardless of completion timestamp.

## 4. Maintenance Cleanup View

- [x] 4.1 Add an abandoned-registration cleanup card to Maintenance & Archive.
- [x] 4.2 Load records where `status = 'pending'` and `onboarding_completed_at IS NULL`.
- [x] 4.3 Display identifying fields, created date, and record age for each abandoned registration.
- [x] 4.4 Visually flag abandoned registrations older than 24 hours while still showing same-day records.
- [x] 4.5 Add per-record deletion using the existing `/api/admin/delete-student` API with confirmation and visible error feedback.
- [x] 4.6 Refresh the cleanup list after successful deletion.

## 5. Verification

- [x] 5.1 Run SQL counts for certified roster, approval-ready pending, and abandoned pending buckets.
- [x] 5.2 Run `npm run build`.
- [x] 5.3 Run `npm run test`.
- [x] 5.4 Manually verify Daily Ops Action Required excludes incomplete pending registrations.
- [x] 5.5 Manually verify Maintenance shows all incomplete pending registrations and flags records older than 24 hours.
