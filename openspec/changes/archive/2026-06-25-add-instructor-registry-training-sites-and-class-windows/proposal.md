## Why

Students currently type training site and instructor details manually during onboarding, which creates inconsistent records and prevents reliable class-based access control. Training staff need approved instructor, site, and class records so new students can select a valid active Site/Class and have scheduling/access dates tied to the class ride-time window instead of a fixed 120-day period.

## What Changes

- Add a public instructor registration entry point and submission flow for instructor, training site, and class details.
- Add admin-reviewed instructor, training site, and training class records with statuses for pending, active, rejected, suspended, and archived records.
- Replace new student manual site/instructor contact entry with one combined student-facing Site/Class selection.
- Save the selected class, site, and instructor relationships on new student records while preserving legacy manual fields for existing records.
- Show only active approved classes within their inclusive class date window in student-facing selection surfaces.
- Use the selected class ride-time end date to set new student `access_until` during approval instead of the fixed 120-day window.
- Enforce selected class date windows in the student scheduling calendar and scheduling write path.
- Keep existing students on their current `access_until` behavior unless an admin manually assigns or migrates them to a class.
- Exclude instructor login, instructor dashboard, class-specific registration links, reporting/export, audit history, and automatic existing-student migration from this first slice.

## Capabilities

### New Capabilities

- `instructor-registry`: Public instructor registration and admin-managed instructor records.
- `training-site-management`: Admin-reviewed training site records used by classes and student selection.
- `training-class-date-windows`: Admin-reviewed training classes with class start and ride-time end dates that drive visibility, scheduling, and access expiration.

### Modified Capabilities

- `student-onboarding`: Replace new student manual instructor/site details with a combined approved Site/Class selection.
- `admin-configurable-registration-fields`: Clarify how configurable registration fields coexist with the required system-managed Site/Class selection.
- `admin-command-center`: Add instructor/site/class pending review and management behavior, and update student approval expiration behavior.
- `student-dashboard`: Limit scheduling to the selected class date window.
- `authentication-authorization`: Preserve existing access checks while deriving new student expiration from selected classes.
- `data-management`: Include new registry tables in export/purge/retention expectations where relevant.
- `input-validation`: Validate instructor registration, class date ranges, Site/Class selection, and scheduling window constraints.
- `notifications-alerts`: Update onboarding/admin notification content to use selected class/site/instructor data when available.

## Impact

- Database: new instructor/site/class tables, status enum or check constraints, foreign keys from students to selected class/site/instructor, RLS policies, indexes, and generated Supabase TypeScript types.
- Supabase RPC/API: update `register_onboarding_student`, add public class-option lookup, add instructor registration submission, add admin review/manage endpoints as needed, and enforce class-window scheduling server-side or through database policy/trigger.
- Student UI: update onboarding registration, Site/Class dropdown loading/error states, dashboard class context, and calendar unavailable-day states.
- Admin UI: update Daily Operations action-required queue, Student Roster countdown hover text, and Maintenance/management surfaces for instructor/site/class records.
- Access behavior: approval no longer always uses 120 days for new class-linked students; middleware, auth callback, and cron sweep continue to rely on `students.access_until`.
- Compatibility: existing student rows and legacy manual instructor/site fields remain intact and continue to work without automatic migration.
