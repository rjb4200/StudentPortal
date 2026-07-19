## 1. Registry Data And Lifecycle Model

- [x] 1.1 Define typed registry view models for sites, instructors, classes, linked students, stored status, and derived class lifecycle.
- [x] 1.2 Refactor Registry data loading to return the relationship and enrollment information required by Classes, Instructors, and Training Sites views.
- [x] 1.3 Implement derived Upcoming, In progress, and Expired class lifecycle calculation using the application current date.
- [x] 1.4 Add Registry summary counts and actionable attention conditions for pending, expired active, and empty class records.

## 2. Classes-First Workspace

- [x] 2.1 Replace permanently expanded creation forms with a Registry workspace header, summary/attention area, and Classes, Instructors, and Training Sites tabs.
- [x] 2.2 Implement the default Classes view with search, stored-status filtering, lifecycle filtering, and a responsive table/card presentation.
- [x] 2.3 Display class site, instructor, date window, stored status, derived lifecycle, and enrolled-student count in the Classes view.
- [x] 2.4 Add a class detail surface that displays enrolled students and links each linked student to `/admin/students/[id]`.
- [x] 2.5 Implement searchable, status-aware Instructors and Training Sites views with their associated relationship context.

## 3. Focused Record Creation And Editing

- [x] 3.1 Add focused create and edit flows for training sites that expose all existing editable site fields.
- [x] 3.2 Add focused create and edit flows for instructors that expose all persisted contact, credential, preference, and site-association fields.
- [x] 3.3 Add focused create and edit flows for classes with site-first instructor selection, date-window validation, and notes.
- [x] 3.4 Update the admin registry endpoint and validation only as needed to support full-record edits while retaining server-side relationship and date validation.
- [x] 3.5 Remove native browser-prompt editing from Registry management.

## 4. Safe Lifecycle Actions

- [x] 4.1 Define allowed Registry lifecycle actions per current status and render only contextual actions in list and detail views.
- [x] 4.2 Require accessible confirmation dialogs for reject, suspend, and archive actions, including the affected record identity and impact copy.
- [x] 4.3 Preserve reactivation through the existing active status transition and ensure no action is offered to approve an already active record.
- [x] 4.4 Verify the class approval email is sent when a class transitions from any non-active status to active and is not sent for no-op active updates.

## 5. Verification

- [x] 5.1 Add or update focused tests for registry API validation, lifecycle transitions, and class approval notifications.
- [x] 5.2 Verify class relationships, roster links, filtering, empty states, and full-record edit persistence against representative registry data.
- [x] 5.3 Verify keyboard navigation, visible focus, tab behavior, filters, dialogs, and responsive Registry layouts at mobile and desktop widths.
- [x] 5.4 Run `npm run test`.
- [x] 5.5 Run `npm run build`.
