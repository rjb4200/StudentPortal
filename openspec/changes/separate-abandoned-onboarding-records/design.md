## Context

The current onboarding lifecycle uses `students.status = 'pending'` for two different states: a student who has only submitted the registration form, and a student who has completed onboarding and is waiting for admin approval. Daily Ops partially compensates by treating `auth_user_id IS NOT NULL` as approval-ready, but the Student Roster still loads all students and therefore shows incomplete/test registration starts.

Live data confirms the failure mode: many `pending` rows have `auth_user_id IS NULL`, including obvious test or abandoned entries. Those rows are not approval-ready and should be managed separately from operational rosters.

## Goals / Non-Goals

**Goals:**
- Introduce an explicit onboarding completion marker on `students`.
- Use the marker, not auth linkage, to decide whether a pending student is approval-ready.
- Keep incomplete pending records out of Daily Ops Action Required and Student Roster.
- Surface incomplete pending records in Maintenance & Archive for cleanup, with records older than 24 hours visually flagged.
- Reuse the existing safe student deletion API for abandoned-registration cleanup.

**Non-Goals:**
- Do not change the public onboarding step sequence.
- Do not auto-delete abandoned records without admin confirmation.
- Do not create a new student status enum value for abandoned/incomplete records.
- Do not change approval semantics for certified students beyond filtering lists correctly.

## Decisions

### Use `onboarding_completed_at` instead of inferring from `auth_user_id`

`auth_user_id` is an implementation detail of login access, not a lifecycle marker. A timestamp gives admins and future code a clear fact: the student completed onboarding at this time and is ready for review.

Alternative considered: continue using `auth_user_id IS NOT NULL`. This is less explicit and could fail if auth linking changes or an auth user exists before completion.

### Keep `status = 'pending'` for both incomplete and approval-ready records

The distinction will be `onboarding_completed_at IS NULL` vs `IS NOT NULL`. This avoids enum churn and preserves the current meaning that the student is not certified yet.

Alternative considered: add a new enum status such as `incomplete` or `abandoned`. That would make status more expressive, but it would require broader middleware, login, dashboard, RLS, and reporting changes. A timestamp is the smaller correct change.

### Backfill only records that are clearly completed or approval-ready

Existing `certified`, `expired`, and `archived` rows should receive a completion timestamp because they passed approval or completed a lifecycle. Existing `pending` rows should receive a timestamp only when they already have `auth_user_id IS NOT NULL`, matching the current approval-ready heuristic. Pending rows without auth linkage remain incomplete.

### Maintenance owns abandoned registration cleanup

Incomplete pending records are operational noise in Daily Ops but useful for cleanup. Maintenance & Archive is already the place for export/purge and long-term data management, so it is the correct location for a cleanup view.

### Flag stale abandoned records at 24 hours, but show all incomplete records

Admins want same-day test/incomplete records visible, while older abandoned records should stand out. The UI should list all incomplete pending records and visually flag those where `created_at < now() - interval '24 hours'`.

## Risks / Trade-offs

- Existing pending students who completed onboarding but failed auth linking will remain incomplete after backfill -> Admins can identify them in Maintenance; future completion retry should set `onboarding_completed_at` only when completion succeeds.
- Client-side list filtering could drift from server-side logic -> Keep query predicates simple and consistent: `pending + onboarding_completed_at` for approval, `certified` for roster, `pending + onboarding_completed_at is null` for abandoned cleanup.
- Adding a nullable timestamp requires generated type updates -> Regenerate Supabase TypeScript types after applying the migration.
- Deleting abandoned records is permanent -> Reuse `/api/admin/delete-student`, retain double-confirm UI, and avoid bulk auto-deletion.

## Migration Plan

1. Add nullable `students.onboarding_completed_at timestamptz`.
2. Backfill `onboarding_completed_at` for rows where `status IN ('certified', 'expired', 'archived')` or where `status = 'pending' AND auth_user_id IS NOT NULL`.
3. Add an index that supports pending approval and abandoned cleanup filters.
4. Apply the migration to the live Supabase project.
5. Regenerate `src/lib/supabase/database.types.ts`.
6. Update onboarding completion, Daily Ops, and Maintenance UI queries.
7. Verify with read-only SQL counts that approval-ready, abandoned, and certified buckets are mutually understandable.

Rollback would remove UI usage first, then drop the column only if no production decision depends on the timestamp. Since the column is additive and nullable, leaving it in place is safer than destructive rollback.
