## 1. Current-State Validation

- [x] 1.1 Review `src/components/admin/maintenance-archive.tsx` and existing admin API routes to confirm current export, purge, abandoned-registration deletion, audit, and calendar-feed behavior.
- [x] 1.2 Confirm whether the implementation will extend `audit_log` schema or encode reason/count details in the existing `action` field.
- [x] 1.3 If extending `audit_log`, add a Supabase migration and update `src/lib/supabase/database.types.ts` after generating or manually applying type changes.

## 2. Server-Side Safety APIs

- [x] 2.1 Add validation schemas for purge dry-run, purge execute, audit retrieval if needed, and reason-aware student deletion payloads.
- [x] 2.2 Add an admin-only purge dry-run endpoint that returns counts for students, schedules, evaluations, messages, and admin notes plus preserved categories.
- [x] 2.3 Add an admin-only purge execute endpoint that validates export prerequisite state, dry-run context, typed confirmation, and reason before deleting student data.
- [x] 2.4 Ensure purge execution writes an audit entry containing performer, reason, and impact summary.
- [x] 2.5 Update `/api/admin/delete-student` to accept and validate an admin reason for abandoned-registration cleanup deletion requests.
- [x] 2.6 Ensure successful abandoned-registration cleanup deletion writes an audit entry with performer, reason, and student identity context.
- [x] 2.7 Add or reuse an admin-only audit retrieval path for recent maintenance-related audit activity.

## 3. Maintenance UI Redesign

- [x] 3.1 Restructure `MaintenanceArchive` into distinct export, archive cleanup, purge, calendar-feed, and audit visibility sections.
- [x] 3.2 Apply WFD-branded risk styling: crimson for destructive actions, gold for caution/review, sage for completion/safe states, and charcoal for command framing.
- [x] 3.3 Add visible export preparation, success, and failure feedback, including export date or filename context on success.
- [x] 3.4 Add abandoned-registration delete confirmation UI with record details, reason input, typed confirmation, pending state, success feedback, and error feedback.
- [x] 3.5 Add purge dry-run review UI that displays impacted counts, preserved categories, export prerequisite status, reason input, typed confirmation, pending state, completion feedback, and error feedback.
- [x] 3.6 Add calendar-feed copy feedback and sensitivity guidance for the aggregate all-students feed.
- [x] 3.7 Add recent audit activity or a clear audit visibility section within Maintenance & Archive.

## 4. Verification

- [x] 4.1 Add or update unit tests for validation and new admin maintenance API behavior where practical.
- [x] 4.2 Verify unauthorized users cannot access new admin maintenance API paths.
- [x] 4.3 Verify destructive actions are blocked without reason, blocked without typed confirmation, and blocked before the required export prerequisite.
- [x] 4.4 Run `npm run test`.
- [x] 4.5 Run `npm run build`.
