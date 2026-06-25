## Context

Student onboarding currently collects `school_name`, `instructor_name`, and `instructor_contact` as free-text fields rendered from `registration_fields`. The registration API calls `register_onboarding_student`, which writes those fields to `students`. Admin approval currently sets `students.access_until` to 120 days from approval, and the dashboard calendar writes schedule requests directly to `schedules` from the client.

Issue #1 changes that model for new students. Training staff need approved instructor, training site, and class records. Students should select one approved Site/Class option, and the selected class should determine the student's site, instructor, visibility window, scheduling window, and access expiration.

## Goals / Non-Goals

**Goals:**

- Add public instructor registration that submits instructor, site, and class information for admin review.
- Add admin-managed instructor, training site, and training class records.
- Require new student registrations to select one visible approved Site/Class option.
- Preserve legacy manual student site/instructor fields for existing records and compatibility.
- Set new class-linked student access expiration from the class `ride_time_end_date`.
- Enforce class date windows in both UI and write path for schedule creation.
- Keep existing middleware, auth callback, and cron expiration behavior centered on `students.access_until`.

**Non-Goals:**

- Instructor login or instructor dashboard.
- Instructor-owned class management.
- Class-specific registration links.
- Reporting/export by class beyond basic inclusion in master export.
- Audit-history tables for instructor/site/class changes.
- Automatic migration of existing students into classes.

## Decisions

### Public submission without instructor auth

Use a public instructor registration form backed by server-side API routes and admin-client writes. Submitted records remain `pending` until an admin approves them.

Alternatives considered:

- Instructor auth in phase 1: rejected because it adds Supabase Auth users, instructor roles, ownership RLS, and a dashboard before the core registry is proven.
- Direct anonymous inserts through Supabase client: rejected because server-side validation and controlled multi-table writes are safer for pending public submissions.

### Three registry tables with status fields

Create `training_sites`, `instructors`, and `training_classes` with UUID primary keys, `status`, approval metadata, timestamps, and foreign keys from classes to site/instructor. Add nullable `students.training_site_id`, `students.instructor_id`, and `students.training_class_id` foreign keys.

Alternatives considered:

- Single denormalized class table: rejected because instructors/sites need independent status, editing, suspension, archival, and reuse.
- Reusing configurable registration fields: rejected because Site/Class selection needs relational IDs, visibility filtering, and access/scheduling behavior.

### Preserve legacy student fields

Keep `students.school_name`, `students.instructor_name`, and `students.instructor_contact` for existing rows and compatibility. For new class-linked students, populate legacy display fields from the selected class/site/instructor where required by current NOT NULL constraints and notification templates.

Alternatives considered:

- Drop or nullable-migrate legacy fields immediately: rejected because existing code and generated types still rely on them, and old records must remain readable.

### Class visibility uses local calendar dates

Store `class_start_date` and `ride_time_end_date` as `date`. Student-facing class options are visible when the current application-local date is between those dates inclusive and class/site/instructor statuses are active.

Alternatives considered:

- Store timestamps: rejected for visibility because the requirement is calendar-day based and timestamp boundaries risk timezone appearance/disappearance errors.

### Access expiration still uses `students.access_until`

On approval, if a student has `training_class_id`, set `access_until` from the selected class `ride_time_end_date`; otherwise preserve the legacy 120-day behavior for existing/unassigned students. Middleware, auth callback, and cron sweep continue to check `students.access_until`.

Alternatives considered:

- Compute expiration dynamically from joins on every access check: rejected because existing access enforcement is simple and already centralized around `students.access_until`.

### Scheduling writes must be server/database enforced

The calendar UI should grey out dates outside the selected class window, but enforcement must also happen in the schedule creation path. Prefer moving student schedule creation behind an API route or adding a database trigger/RLS `WITH CHECK` that rejects dates outside the student's selected class window.

Alternatives considered:

- UI-only validation: rejected because client-side inserts can be bypassed or regress.

## Risks / Trade-offs

- Public instructor submissions can create spam or low-quality pending records -> Mitigate with strict Zod validation, bounded fields, server-only writes, and pending-only public behavior.
- Legacy NOT NULL fields can conflict with new relational selection -> Mitigate by retaining and backfilling legacy display values for new class-linked students during registration.
- RLS can accidentally expose pending/future/expired classes -> Mitigate by using server-side class option APIs or tightly scoped SELECT policies that only return active currently visible classes.
- Class date comparisons can be off by one day -> Mitigate by using `date` columns and one shared local-date helper for visibility and scheduling checks.
- Direct schedule inserts currently bypass server validation -> Mitigate by replacing client inserts with an API route or enforcing the class window at the database layer before UI-only changes ship.

## Migration Plan

1. Add tables, constraints, indexes, foreign keys, RLS policies, and student nullable foreign keys in a Supabase migration.
2. Update generated Supabase TypeScript types after applying DDL.
3. Add server-side APIs for public instructor registration, student visible class options, student registration with selected class, and admin registry management.
4. Update public and student onboarding UI to use the class option API.
5. Update admin Daily Operations and management surfaces.
6. Update approval and scheduling enforcement.
7. Verify with `npm run build` and targeted tests where available.

Rollback strategy: keep new columns nullable and legacy fields intact. If UI/API rollout must be reverted, existing student registration can continue using legacy fields while new registry tables remain unused.

## Open Questions

- What exact local timezone should date-window comparisons use? Existing iCal output uses `America/New_York`, so that is the likely application timezone.
- Should rejected public instructor submissions retain admin notes/reason text in phase 1, or is status-only rejection sufficient?
- Should the master purge delete instructor/site/class registry records, or preserve them like preceptors? The first implementation should choose explicitly before coding purge behavior.
