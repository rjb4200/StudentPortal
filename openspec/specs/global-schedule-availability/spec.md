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

### Requirement: Global date-range schedule blocks
The system SHALL let an authorized admin create global schedule blocks for every calendar date in an inclusive start-to-end range through one range action. The range action SHALL accept an optional student-visible reason, create independent daily blocks using the existing availability model, and preserve any date that was already blocked.

#### Scenario: Admin blocks a consecutive period
- **WHEN** an admin submits a valid start date of August 3 and end date of August 16 with a reason
- **THEN** the system creates a global block for every date from August 3 through August 16 inclusive with that reason

#### Scenario: Single-day range remains valid
- **WHEN** an admin submits the same valid date as the start and end of a range
- **THEN** the system creates one global block using the same behavior as a single-date block

#### Scenario: Existing blocks are preserved
- **WHEN** an admin creates a range containing dates that are already globally blocked
- **THEN** the system leaves those existing block records and their reasons unchanged
- **AND** creates blocks only for the previously open dates in the range

#### Scenario: Invalid range is rejected
- **WHEN** an admin submits an end date before the start date or a range exceeding the configured maximum length
- **THEN** the system rejects the range without creating any blocks

### Requirement: Period block reason input
The period-block form SHALL display its own optional student-visible reason input. The form SHALL submit that value for every newly created date in the selected period without changing the selected-day block reason input or its draft value.

#### Scenario: Administrator explains a period closure
- **WHEN** an administrator enters a reason in the period-block form and blocks a valid range
- **THEN** the period request uses that reason for newly blocked dates

#### Scenario: Selected day changes during period setup
- **WHEN** an administrator enters a period reason and selects a different calendar day
- **THEN** the period reason remains unchanged

### Requirement: Range block impact preview
Before an admin confirms a date-range block, the system SHALL show the inclusive count of dates to be evaluated, the count of dates already blocked, and counts of existing pending and approved schedules within the range. The preview SHALL state that existing schedules remain unchanged.

#### Scenario: Range contains existing schedules
- **WHEN** an admin selects a valid date range containing pending and approved schedules
- **THEN** the preview displays the pending and approved schedule counts before the admin creates the blocks
- **AND** creating the blocks leaves those schedules in their current states

#### Scenario: Range contains existing blocks
- **WHEN** an admin selects a valid date range that includes already-blocked dates
- **THEN** the preview identifies the number of already-blocked dates and explains that they will be preserved

### Requirement: Individual reopening after range blocking
Every date created through a range action SHALL remain removable through the existing individual-date block removal action. Removing one date SHALL not change blocks on other dates from the original range.

#### Scenario: Admin reopens an exception day
- **WHEN** an admin removes one blocked date that was created as part of a range
- **THEN** new shift requests for that date become eligible subject to normal scheduling rules
- **AND** all other dates from the original range remain blocked
