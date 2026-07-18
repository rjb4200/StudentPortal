## ADDED Requirements

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
