## Context

`RegistryManagement` currently fetches every site, instructor, class, and class-linked student in one client component. It renders three always-open creation forms followed by independent cards for sites, instructors, and classes. Editing is limited to native browser prompts for a site name or class date window; instructor records cannot be edited from the screen. Every row presents the same status actions regardless of its current state.

Registry records already support the needed relationships and lifecycle values: sites, instructors, and classes use `pending`, `active`, `rejected`, `suspended`, and `archived`, while classes have a date window and students link to a class. The existing admin operational component set supplies tabs, fact grids, tables, alerts, responsive containers, and confirmation dialogs. The class approval email sent by the status route must continue to send only when a class transitions to active.

## Goals / Non-Goals

**Goals:**

- Make classes the default registry work surface and expose actionable class lifecycle information.
- Let admins search, filter, inspect, create, and fully edit class, instructor, and site records without overwhelming the page.
- Expose class-to-site, class-to-instructor, and class-to-student relationships, with navigation to existing student profiles.
- Prevent accidental lifecycle changes by presenting only valid contextual actions and confirming consequential changes.
- Preserve current database tables, public registration, onboarding availability rules, status values, and approval-email behavior.

**Non-Goals:**

- Adding registry schema fields, audit-history tables, bulk lifecycle actions, or instructor authentication.
- Changing how class date windows determine student visibility, schedule eligibility, or access expiration.
- Changing public instructor registration or existing student profile behavior.
- Introducing server-side pagination before registry volume requires it.

## Decisions

### Classes-first workspace with entity tabs

The Registry screen will provide an overview/attention area followed by Classes, Instructors, and Training Sites tabs, with Classes selected initially. The primary create action will match the selected entity; creation forms will appear only while an admin intentionally creates or edits a record.

Rationale: classes join together the relationships an admin needs to manage, while sites and instructors are supporting directories. Hiding inactive forms recovers the page's primary visual hierarchy.

Alternatives considered:

- Retain three parallel columns and collapse only the forms: rejected because operators still cannot scan or compare relationships across records.
- Create separate routes per entity: deferred because the current Registry tab and record count do not justify a navigation expansion.

### Derived class lifecycle is distinct from registry status

The interface will derive `Upcoming`, `In progress`, and `Expired` labels from a class's date window and the application current date. It will render this alongside, rather than replacing, the stored registry status. The attention area will call out active expired classes and other actionable conditions such as pending or empty classes.

Rationale: an `active` class can be administratively valid while not currently usable due to its date window. Separating the concepts makes expiry maintenance visible without modifying the existing status model.

Alternatives considered:

- Automatically archive expired classes: rejected because dates may need correction or extension and archival is an administrative decision.
- Add date lifecycle values to `registry_status`: rejected because those are derived, not durable state.

### Full-record panel/dialog editing

Creation and editing will use the same focused form pattern for each entity and include every existing editable field. Class forms retain site-first instructor selection and the server-side site/instructor consistency validation. The UI will not use browser `prompt` for record edits.

Rationale: a registry cannot be maintained when most persisted record fields are inaccessible. Reusing entity forms prevents field drift between create and edit behavior.

Alternatives considered:

- Inline table editing: rejected because instructor and site details are too wide for a useful responsive table.
- Separate full-page editors: deferred because record density is low and an in-context editor preserves the operator's filter state.

### Contextual status transitions with confirmation

Each row or detail panel will display only lifecycle actions meaningful for its current status. Approving an active record will not be offered. Reject, suspend, and archive actions will require an accessible confirmation dialog that identifies the record and its impact. Re-activating a suspended, rejected, or archived record remains possible using the existing active status transition.

Rationale: current controls invite redundant or accidental transitions. Confirmation protects registry availability while retaining the existing status API and approval semantics.

Alternatives considered:

- Require confirmation for every action: rejected because routine approval and reopening would become unnecessarily slow.
- Remove rejected records from management: rejected because public submissions and historical decisions must remain reviewable.

### Responsive table and card presentation using shared primitives

Entity lists will use the existing `DataTable`, `Tabs`, `FactGrid`, `StatusBanner`, `EmptyState`, and `ConfirmDialog` patterns. Desktop tables will prioritize identifiers, relationships, status/lifecycle, and actions. Small screens will retain the same data and actions in readable stacked record cards or an equivalent accessible responsive layout.

Rationale: registry entries need scanning and filtering on desktop, but the current three-column layout is unusable at smaller widths. This preserves the established admin visual language.

## Risks / Trade-offs

- [Client-side relationship loading becomes more complex] -> Centralize loading and derived view-model calculation within the registry feature; retain the existing server-side write endpoints as the authority for writes.
- [Filtered views conceal attention records] -> Overview counts and attention links will set or clear filters explicitly and visibly.
- [Status transition changes could suppress the class approval email] -> Keep the current server-side transition check and test activation from every non-active class status.
- [A class can have linked students when its site or instructor is changed] -> Show linked-student context and clear impact copy before consequential lifecycle actions; preserve existing foreign-key constraints.
- [Full editing can expose validation gaps] -> Reuse current client constraints and preserve server-side Zod validation and site/instructor association validation.

## Migration Plan

1. Refactor the Registry component around the classes-first workspace and existing shared operational primitives.
2. Extend the existing registry API validation and response handling only as needed to support full editing without changing the data model.
3. Verify registry actions, class approval notification behavior, student profile navigation, keyboard operation, and responsive layouts.
4. Deploy as a UI/API-compatible change. No data migration is required.

Rollback: restore the prior Registry component and retain all existing records and endpoints; no persisted data is transformed by this change.

## Open Questions

- Should empty active classes be an attention condition indefinitely, or only after their start date?
- Should the detail view show a compact roster directly, or only student names that link to `/admin/students/[id]`?
- Should an administrator be able to change a class's site or instructor after students are linked, or should that require a separate reassignment workflow?
