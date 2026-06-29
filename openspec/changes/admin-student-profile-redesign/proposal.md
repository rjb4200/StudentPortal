## Why

The admin currently has no dedicated student profile page. When an admin clicks a student from the roster, they land on a bare inline edit form under `/admin/accounts?edit=<id>` that shows only denormalized text fields. Linked data — instructors, TEIs, classes, signed legal documents, schedules, admin notes, quiz flags — exists in the database but is never assembled into a unified view. Admins need a rich, single-page profile that surfaces the full institutional context for each student.

## What Changes

- **New route**: `/admin/students/[id]` — a full student profile page with progressive-disclosure sections
- **Status summary card** at the top showing key student state at a glance (status, class, instructor, TEI, dates, test/doc status)
- **Expandable Instructor section** — resolves the `instructor_id` FK to display complete instructor record with quick actions (email, copy, link to instructor)
- **Expandable TEI section** — resolves the `training_site_id` FK to display the training site record
- **Expandable Class section** — resolves the `training_class_id` FK to display class dates, site, and instructor
- **Signed Legal Documents section** — table of the student's accepted documents with status, signed date, and view/print actions
- **Admin Notes section** — CRUD on the existing `admin_notes` table, visible only to admins
- **Onboarding Test section** — displays quiz flags and completion status
- **Ride History section** — displays the student's schedules (rides) with status filtering
- **Data completeness warnings** — banners when related data is missing (no TEI, missing contact info, unsigned docs, incomplete test)
- **Full packet export** — printable view assembling all profile sections
- **Student Roster link updated** — clicking a student name in DailyOps navigates to the new profile instead of the accounts edit form
- **Visual redesign** — progressive-disclosure pattern: clean collapsed headers with rich detail on expand; status-driven color accents using the existing `wfd-` palette

## Capabilities

### New Capabilities
- `admin-student-profile`: Dedicated student profile page at `/admin/students/[id]` with status summary card, expandable instructor/TEI/class sections, and data completeness warnings
- `admin-student-legal-documents`: Admin view and print of signed legal documents from the student profile, with document access audit logging
- `admin-student-notes`: Internal admin-only notes on student profiles using the existing `admin_notes` table

### Modified Capabilities
<!-- No existing specs are modified. The roster link destination change is an implementation detail. -->

## Impact

- New route: `src/app/admin/students/[id]/page.tsx`
- New UI components: `Disclosure`, `StudentSummaryCard`, `InstructorSection`, `TeiSection`, `ClassSection`, `LegalDocumentsSection`, `AdminNotesSection`, `OnboardingTestSection`, `RideHistorySection`, `DataCompletenessWarnings`
- New API routes: `GET /api/admin/students/[id]/legal-documents`, `POST /api/admin/students/[id]/notes`, `DELETE /api/admin/students/[id]/notes`
- Modified: `src/components/admin/daily-ops.tsx:532` (roster link target)
- New audit log entries for document view/print events
- No database migrations required (all tables already exist)
