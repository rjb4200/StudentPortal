## Why

GitHub issue #42 reports that onboarding completion replaces `students.id` with a Supabase Auth user id, changing the primary identity of an existing student/enrollment row after related compliance and operational data may already reference it. Student records must preserve stable enrollment identity so legal signatures, onboarding history, schedules, messages, evaluations, and audit trails remain tied to the correct rotation.

This also needs to support repeat real students without overwriting history, while giving admins a safe way to repeatedly test onboarding with the same email address without polluting production history.

## What Changes

- Stop mutating `students.id` during onboarding completion, approval, or auth user creation.
- Add an `auth_user_id` field on `students` for the Supabase Auth account link.
- Add `archived` to student status values and preserve `is_blacklisted` as the restricted-access flag.
- Add `previous_student_id` so a new enrollment can reference an earlier student/enrollment record for the same person.
- Add `is_test_record` to distinguish admin-controlled test records from real student records.
- Update student dashboard, middleware, login, onboarding completion, and RLS assumptions so authenticated student access resolves through `students.auth_user_id` instead of `students.id`.
- Change self-registration duplicate-email behavior to preserve real historical records and create a new enrollment for expired or archived students where appropriate.
- Add an admin-only test reset workflow for records marked `is_test_record`, including safe cleanup of test-generated state and optional auth user unlink/deletion.
- Ensure self-registration never automatically marks records as test records.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `student-onboarding`: registration and repeat-onboarding behavior must preserve prior real student records and support new enrollment rows for expired or archived students.
- `onboarding-completion-flow`: quiz completion must create or reuse auth users without changing `students.id`, and must link auth through `auth_user_id`.
- `authentication-authorization`: authenticated student access and RLS ownership checks must use `students.auth_user_id` to find the active enrollment row.
- `data-management`: the student schema must include stable enrollment identity fields, `archived` status, and `is_test_record` for safe test cleanup.
- `admin-account-management`: admins must be able to manage the new student fields and reset only test records through an explicit admin-only workflow.

## Impact

- Database schema and migrations: `students` columns, student status enum/check values, indexes, RLS policies, RPC registration behavior, and generated Supabase TypeScript types.
- Server routes and auth flows: onboarding completion notification, login validation, auth callback, dashboard rendering, middleware checks, and any approval/auth helper that currently assumes `students.id = auth.users.id`.
- Admin UI/API: student account editing, test-record flag management, and test account reset behavior.
- Historical data integrity: existing student-related foreign keys continue to reference immutable `students.id` enrollment rows.
