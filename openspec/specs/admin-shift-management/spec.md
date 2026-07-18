# admin-shift-management Specification

## Purpose
Tabbed shift management table (Approved/Cancelled/Rejected/All) with filtering in the admin Daily Operations panel, replacing the removed Recent Activity and Welcome Message cards.
## Requirements
### Requirement: Shift management tabbed table
The admin Daily Operations tab SHALL include a Shift Management section that displays schedules in a filterable table organized by status tabs. The section SHALL replace the existing Recent Activity and Welcome Message cards. Each status tab SHALL display a count of matching records.

#### Scenario: Approved tab shows active shifts
- **WHEN** an admin views the Shift Management section and the Approved tab is selected
- **THEN** all schedules with `status = 'approved'` are displayed in a table with columns: Date, Student, Type, Time, Status, and an admin Cancel button per row

#### Scenario: Cancelled tab shows history
- **WHEN** an admin selects the Cancelled tab
- **THEN** all schedules with `status = 'cancelled'` are displayed, including who initiated the cancellation (student or admin) and any cancel note

#### Scenario: Rejected tab shows rejected requests
- **WHEN** an admin selects the Rejected tab
- **THEN** all schedules with `status = 'rejected'` are displayed

#### Scenario: All tab shows complete history
- **WHEN** an admin selects the All tab
- **THEN** all schedules regardless of status are displayed

#### Scenario: Tab badge counts match filter
- **WHEN** the Shift Management section loads
- **THEN** each tab displays a count of schedules matching that status in parentheses (e.g., "Approved (5)")

### Requirement: Shift management filtering
The Shift Management table SHALL support filtering by date range and student name.

#### Scenario: Filter by date range
- **WHEN** an admin enters a start date and end date in the date range filters
- **THEN** the table displays only schedules with dates within that range

#### Scenario: Filter by student
- **WHEN** an admin selects a student from the student dropdown filter
- **THEN** the table displays only schedules belonging to that student

#### Scenario: Combined filters
- **WHEN** an admin applies both a date range and a student filter
- **THEN** the table displays only schedules matching both criteria

### Requirement: Admin cancel from shift management
The Shift Management table SHALL provide a Cancel button on each approved schedule row, allowing the admin to cancel the shift with an optional note. The cancellation SHALL succeed even if the notification email cannot be delivered.

#### Scenario: Admin cancels approved shift from table
- **WHEN** an admin clicks the Cancel button on an approved schedule row, optionally enters a note, and confirms
- **THEN** the schedule status changes to `cancelled`, `cancelled_by` is set to `admin`, the row moves from the Approved tab to the Cancelled tab, and the system attempts to send a cancellation email to the student

#### Scenario: Cancel button not shown on non-approved rows
- **WHEN** the Shift Management table displays cancelled or rejected schedules
- **THEN** no Cancel button is rendered on those rows

#### Scenario: Email failure during admin cancellation
- **WHEN** an admin cancels a shift and the email provider is unreachable
- **THEN** the schedule status is still updated and the API returns `{ success: true }`
- **AND** the email failure is logged

### Requirement: Admin calendar schedule management
The admin SHALL have a monthly Calendar section that displays global blocked dates and schedule counts by status for each date. Selecting a date SHALL reveal its block state and all schedules for that date.

#### Scenario: Admin views a calendar month
- **WHEN** an admin opens the Calendar section
- **THEN** the system displays a monthly calendar with blocked dates and counts for pending, approved, rejected, and cancelled schedules on dates containing records

#### Scenario: Admin inspects a date
- **WHEN** an admin selects a date in the Calendar section
- **THEN** the system displays that date's block state, optional block reason, and schedules with student, shift time, and status details

### Requirement: Admin manages global blocks from the calendar
The Calendar section SHALL let an admin create, edit, and remove a global block for the selected date. The UI SHALL communicate that the block prevents new requests but preserves existing schedules.

#### Scenario: Admin blocks selected date
- **WHEN** an admin selects an unblocked date, optionally enters a reason, and confirms the block
- **THEN** the date becomes visibly blocked in the calendar and new schedule requests for it are denied

#### Scenario: Admin removes selected-date block
- **WHEN** an admin removes a block from the selected date
- **THEN** the calendar no longer presents the date as blocked and normal new-request eligibility is restored

### Requirement: Pending schedules on blocked dates require attention
The admin calendar SHALL visually highlight the count and detail rows for pending schedules whose date is globally blocked. Those schedules SHALL remain pending until an admin explicitly resolves each request.

#### Scenario: Blocked date has unresolved requests
- **WHEN** a globally blocked date has one or more pending schedules
- **THEN** the date cell and selected-date details visibly identify the pending-on-blocked-day count
- **AND** no pending schedule is automatically rejected or cancelled
