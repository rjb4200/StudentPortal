# global-schedule-availability

## Purpose

Define global date availability controls for student scheduling.

## Requirements

### Requirement: Global single-date schedule blocks
The system SHALL let an authorized admin create and remove a global block for one calendar date. A block SHALL apply to every student and MAY include an optional student-visible reason.

#### Scenario: Admin blocks a date with a reason
- **WHEN** an admin blocks a date and provides a reason
- **THEN** the system stores one global block for that date and makes the reason available to students

#### Scenario: Admin blocks a date without a reason
- **WHEN** an admin blocks a date without a reason
- **THEN** the system stores the global block and presents the date as unavailable without reason text

#### Scenario: Admin removes a block
- **WHEN** an admin removes a global block
- **THEN** new shift requests for that date are eligible again subject to the normal student and class-window rules

### Requirement: New schedule requests are denied on blocked dates
The system SHALL reject every new schedule request whose date has a global block, regardless of whether the request originates from the dashboard UI or another application writer.

#### Scenario: Student selects a blocked date
- **WHEN** a certified student views a globally blocked date that has no personal schedule
- **THEN** the date is visibly unavailable and cannot open a shift request flow

#### Scenario: Request bypasses the calendar UI
- **WHEN** a caller submits a valid-looking schedule request for a globally blocked date directly to the request API or database writer
- **THEN** no schedule record is created and the caller receives an unavailable-date error

### Requirement: Existing schedules survive a new date block
Creating a global block SHALL NOT modify, cancel, reject, or otherwise invalidate schedules that already exist for that date. Existing pending schedules SHALL remain available for later admin approval or rejection.

#### Scenario: Blocked day contains approved schedule
- **WHEN** an admin blocks a date that already has approved schedules
- **THEN** those schedules remain approved and visible to their students and administrators

#### Scenario: Blocked day contains pending schedule
- **WHEN** an admin blocks a date that already has pending schedules
- **THEN** those schedules remain pending and are flagged as pending on a blocked date in the admin calendar

### Requirement: Block metadata is access controlled
The system SHALL permit students to read global block dates and optional reasons needed for their calendar, while only authorized admins can create, edit, or remove blocks. Audit metadata SHALL not be exposed to students.

#### Scenario: Student reads availability
- **WHEN** an authenticated student loads their scheduling calendar
- **THEN** they receive global block dates and optional reasons but not internal creator metadata

#### Scenario: Non-admin attempts to manage a block
- **WHEN** a non-admin attempts to create, modify, or delete a global block
- **THEN** the operation is denied
