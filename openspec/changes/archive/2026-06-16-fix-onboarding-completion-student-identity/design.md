## Context

Onboarding completion currently creates or reuses a Supabase Auth user and then attempts to align the student row primary key with the auth user id. This breaks the data model because `students.id` is already used as the stable foreign key for enrollment-scoped records such as legal signatures, schedules, messages, evaluations, notes, and audit references.

The corrected model treats `students.id` as the immutable enrollment/rotation id. Supabase Auth linkage belongs in a separate nullable `students.auth_user_id` column. Repeat real students should receive new enrollment rows instead of overwriting or resetting old records. Test records need an explicit flag so admins can reset test-only state without risking real student history.

## Goals / Non-Goals

**Goals:**

- Preserve `students.id` for the lifetime of each student/enrollment row.
- Link Supabase Auth users to student rows through `students.auth_user_id`.
- Add `archived` status for non-active historical records while keeping `is_blacklisted` for restricted students.
- Add `students.previous_student_id` for repeat enrollment lineage.
- Add `students.is_test_record` for admin-controlled testing and reset workflows.
- Update access control, dashboard lookup, login validation, onboarding completion, and RLS assumptions to use `auth_user_id` where they depend on authenticated identity.
- Preserve historical data for real student records.

**Non-Goals:**

- Replace the current Supabase Auth provider or magic-link approach.
- Redesign the entire onboarding flow beyond identity and repeat-registration behavior.
- Automatically infer test accounts from email addresses during self-registration.
- Delete or collapse real historical student records.
- Replace the current `is_blacklisted` access restriction pattern in this change.

## Decisions

1. Keep `students.id` as immutable enrollment identity.

   Rationale: existing foreign keys and compliance data already rely on `students.id`. Mutating it risks orphaning records or changing what a historical record means.

   Alternative considered: keep forcing `students.id = auth.users.id`. This was rejected because one auth user can represent a person across multiple rotations, while each student row represents a specific enrollment/rotation.

2. Add `students.auth_user_id uuid NULL UNIQUE` for auth linkage.

   Rationale: authenticated requests can resolve the current student row by `auth.uid() = students.auth_user_id` without changing primary keys. `NULL` supports students before auth user creation. A unique constraint prevents one auth account from being linked to multiple active student rows at the same time unless implementation later introduces an explicit multi-enrollment selection model.

   Alternative considered: a separate join table between auth users and student enrollments. This is more flexible, but unnecessary for the current app and larger than needed for issue #42.

3. Use a new `archived` status and keep `is_blacklisted`.

   Rationale: `archived` distinguishes historical/non-active enrollments from `expired`, while `is_blacklisted` continues to represent an access restriction that can apply independently of status.

   Alternative considered: reuse only `expired`. This was rejected because archived records can be administratively retained without implying time-based access expiration.

4. Create new enrollment rows for expired or archived real students who self-register again.

   Rationale: this preserves prior compliance and rotation data while allowing the person to complete a new onboarding cycle.

   Alternative considered: overwrite the prior row. This was rejected because it destroys historical meaning and was the root class of bug reported in issue #42.

5. Add `students.previous_student_id` for lineage instead of changing existing foreign keys.

   Rationale: existing related records remain scoped to the enrollment that created them. Lineage is useful for admin context but should not merge schedules, messages, or evaluations across rotations by default.

   Alternative considered: a new person/profile table. This could be useful later, but it is beyond the minimal safe fix.

6. Treat `is_test_record` as admin-controlled only.

   Rationale: production self-registration must never mark a real student as test data. Admin-only reset behavior can safely clean test-generated state while preserving real records.

   Alternative considered: email-pattern or environment-based auto-test detection. This was rejected for production because it can misclassify real records.

## Risks / Trade-offs

- Existing policies or queries may still assume `students.id = auth.uid()` -> update middleware, dashboard, auth callback, RLS, and any student-scoped queries together.
- Existing data may contain student rows whose `id` already equals an auth user id -> migration should backfill `auth_user_id` where a matching auth user/email relationship is known and must not rewrite `id`.
- Unique `auth_user_id` limits simultaneous multiple active enrollments for the same auth account -> acceptable for the current app; future multi-enrollment support can relax this with an active-enrollment selector.
- Test reset can be destructive for test records -> require admin authorization, require `is_test_record = true`, and never reset non-test records through the test reset path.
- Changing registration duplicate-email behavior can affect in-progress pending students -> block duplicate pending registrations and only create new rows for expired or archived real records.

## Migration Plan

1. Add a Supabase migration that updates the student status values to include `archived`, adds `auth_user_id`, `previous_student_id`, and `is_test_record`, and creates needed constraints/indexes.
2. Backfill `auth_user_id` for existing student rows where a matching Supabase Auth user can be identified without changing `students.id`.
3. Update RLS policies so student ownership checks resolve through `students.auth_user_id = auth.uid()` while related tables continue to store `student_id` as the immutable enrollment id.
4. Replace code paths that query student rows by authenticated user id with `auth_user_id` lookups.
5. Update onboarding completion to link the auth user via `auth_user_id` and never update `students.id`.
6. Update registration RPC behavior for duplicate emails and repeat enrollments.
7. Regenerate `src/lib/supabase/database.types.ts` after applying the live migration.
8. Verify with `npm run build`.

Rollback strategy: avoid destructive data migration. If app rollback is needed, keep the added columns in place and revert app reads to prior behavior only temporarily; do not remove `auth_user_id` or rewrite primary keys. A follow-up migration can remove unused columns only after confirming no deployed code depends on them.

## Open Questions

- None blocking for implementation. Future work may introduce a separate person/profile entity if the app needs richer cross-enrollment history views.
