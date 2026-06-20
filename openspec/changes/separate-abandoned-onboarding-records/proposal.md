## Why

Incomplete onboarding starts are currently stored as `pending` students and appear in admin rosters even though they are not ready for approval. Admins need a clear separation between abandoned registrations, approval-ready students, and certified roster students so test/incomplete records do not pollute daily operations.

## What Changes

- Add an explicit `students.onboarding_completed_at` marker for students who finish the full onboarding flow.
- Treat `pending` students with `onboarding_completed_at IS NOT NULL` as approval-ready.
- Keep `pending` students with `onboarding_completed_at IS NULL` out of Action Required and the Daily Ops Student Roster.
- Limit the Daily Ops Student Roster to approved/certified students.
- Add a Maintenance & Archive abandoned-registration cleanup view that lists incomplete pending records and visually flags records older than 24 hours.
- Allow admins to delete abandoned registrations through the existing safe student deletion path.

## Capabilities

### New Capabilities
<!-- No new standalone capability. This change refines existing onboarding, completion, data-management, and admin command-center behavior. -->

### Modified Capabilities
- `student-onboarding`: Registration-created pending records remain incomplete until full onboarding completion is explicitly recorded.
- `onboarding-completion-flow`: Quiz completion records `onboarding_completed_at` and makes the student approval-ready.
- `data-management`: The students schema includes the completion timestamp used to classify abandoned registrations.
- `admin-command-center`: Action Required, Student Roster, and Maintenance & Archive distinguish approval-ready students from abandoned/incomplete registrations.

## Impact

- Supabase migration adds `students.onboarding_completed_at` with a safe backfill for existing completed/approval-ready rows.
- Supabase TypeScript types must be regenerated after the schema change.
- `src/app/api/notify/onboarding-complete/route.ts` sets the completion timestamp when onboarding completion succeeds.
- `src/components/admin/daily-ops.tsx` filters Action Required and Student Roster by explicit lifecycle state.
- `src/components/admin/maintenance-archive.tsx` adds the abandoned-registration cleanup card.
- Existing `/api/admin/delete-student` remains the deletion path for cleanup records.
