## 1. Database Migration

- [x] 1.1 Add a Supabase migration for `students.auth_user_id`, `students.previous_student_id`, `students.is_test_record`, and `archived` status support.
- [x] 1.2 Add constraints and indexes for `auth_user_id`, `previous_student_id`, status, email lookups, and test-record reset lookups.
- [x] 1.3 Backfill `auth_user_id` for existing student rows where a matching auth user can be safely identified without changing `students.id`.
- [x] 1.4 Update `register_onboarding_student` duplicate-email behavior for pending, certified, expired, archived, blacklisted, and test-record cases.
- [x] 1.5 Update RLS policies so student ownership checks use `students.auth_user_id = auth.uid()` while related tables continue using `student_id` as the enrollment id.
- [x] 1.6 Apply the migration live with the Supabase migration tool and regenerate `src/lib/supabase/database.types.ts`.

## 2. Auth And Onboarding Code

- [x] 2.1 Update onboarding completion notification code to create or reuse auth users, set `students.auth_user_id`, and never update `students.id`.
- [x] 2.2 Update login email validation to handle active, pending, expired, archived, and blacklisted student records according to the specs.
- [x] 2.3 Update auth callback, middleware, and dashboard lookups to resolve students by `auth_user_id` instead of `id`.
- [x] 2.4 Review and update or remove legacy approval/auth helper code that mutates `students.id`.
- [x] 2.5 Ensure pending students with auth access can view only the pending dashboard state and certified students can view the full dashboard state.

## 3. Admin Account Management

- [x] 3.1 Update admin student editing UI and API handling for `archived`, `is_test_record`, `auth_user_id`, and `previous_student_id` fields without allowing `students.id` edits.
- [x] 3.2 Add an admin-only test reset API or maintenance action that only operates on records where `is_test_record = true`.
- [x] 3.3 Implement test reset cleanup for test approval state, onboarding progress, schedules, messages, and linked auth user state where safe.
- [x] 3.4 Block test reset when any matching non-test student record would be affected and return a clear admin-facing error.

## 4. Verification

- [x] 4.1 Verify new public self-registration never sets `is_test_record = true`.
- [x] 4.2 Verify repeat registration creates a new pending enrollment linked by `previous_student_id` for expired or archived real students.
- [x] 4.3 Verify onboarding completion preserves `students.id` and links auth through `auth_user_id`.
- [x] 4.4 Verify middleware blocks expired, archived, and blacklisted student dashboard access and allows pending/certified access as specified.
- [x] 4.5 Verify admin-only test reset cannot modify non-test student records.
- [x] 4.6 Run `npm run build`.
