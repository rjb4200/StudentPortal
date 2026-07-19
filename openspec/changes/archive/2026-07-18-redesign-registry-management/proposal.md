## Why

The Registry tab presents three permanently expanded creation forms and three disconnected record lists, making it difficult to find current classes, understand class enrollment, or safely maintain registry records. The live registry already contains expired active classes and empty classes, so the page needs to become an operational management surface rather than a CRUD form dump.

## What Changes

- Reorganize Registry around a classes-first overview with actionable counts for pending, current, expired, and empty class records.
- Add focused Classes, Instructors, and Training Sites views with search, lifecycle/status filtering, and responsive record tables or cards.
- Show class relationships, date-window lifecycle, enrollment counts, and links to associated student profiles.
- Replace always-visible creation forms and browser-prompt editing with focused add and full-record edit flows.
- Make lifecycle controls contextual to the current record state, and require confirmation before rejecting, suspending, or archiving a record.
- Preserve the current registry tables, status values, approval emails, public registration flow, and student class associations.

## Capabilities

### New Capabilities
- `registry-management`: Classes-first administrative management of training classes, instructors, and training sites, including lifecycle visibility, record editing, enrollment context, and safe status actions.

### Modified Capabilities

- None.

## Impact

- Affected UI: `src/components/admin/registry-management.tsx`, shared admin operational components, and the Registry tab at `/admin?tab=registry`.
- Affected API behavior: existing admin registry create/update and status endpoints may need expanded responses or validation to support full editing and contextual actions.
- Affected data reads: registry views will join existing classes, sites, instructors, and students; no schema or migration changes are expected.
- Existing links to `/admin/students/[id]`, class approval email behavior, and public instructor registration must remain intact.
