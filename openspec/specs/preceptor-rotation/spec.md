# preceptor-rotation

## Purpose

Place preceptors on the 24/48 crew rotation so the Training Major can staff each day, pair one preceptor to a student at approval, control sign-ups against available coverage, and let students see who they will ride with. Preceptor coverage is derived from the rotation and is a planning estimate, not actual attendance.

## Requirements

### Requirement: Preceptor shift assignment
The system SHALL allow an authorized admin to assign an active preceptor to exactly one crew shift: First, Second, or Third. Assignment SHALL be made by selecting a preceptor by name from the existing preceptor roster and SHALL be editable. A preceptor SHALL remain on their assigned shift until an admin changes it.

#### Scenario: Admin assigns a preceptor to a shift
- **WHEN** an admin adds a preceptor by name and assigns them to Second Shift
- **THEN** the preceptor is recorded on Second Shift

#### Scenario: Admin reassigns a preceptor
- **WHEN** an admin changes a preceptor's shift from Second to Third
- **THEN** the preceptor is recorded on Third Shift

#### Scenario: Unassigned preceptor has no shift
- **WHEN** a preceptor has no shift assigned
- **THEN** the preceptor appears in no day's pool

#### Scenario: Non-admin cannot assign shifts
- **WHEN** a non-admin attempts to assign or change a preceptor's shift
- **THEN** the operation is denied

### Requirement: Daily preceptor pool from the rotation
The system SHALL derive, for any calendar date, a preceptor pool consisting of the active preceptors whose assigned shift equals the crew shift for that date under the existing three-day 24/48 rotation. Chiefs SHALL NOT be included in the pool or its count, and inactive preceptors SHALL be excluded.

#### Scenario: Pool matches the day's shift
- **WHEN** the rotation identifies First Shift for a date
- **THEN** that date's preceptor pool contains only active preceptors assigned to First Shift

#### Scenario: Chiefs are not counted
- **WHEN** the system computes a date's preceptor count
- **THEN** the on-duty Chief is not included in the count

#### Scenario: Inactive preceptor is excluded
- **WHEN** a preceptor on the day's shift is inactive
- **THEN** the preceptor is not part of the pool or the count

#### Scenario: Pool changes with the rotation day
- **WHEN** the rotation advances to the next shift on a later date
- **THEN** the pool for that later date contains the preceptors of the new shift

### Requirement: Admin calendar preceptor coverage count and disclaimer
The admin scheduling calendar SHALL display, for each visible date, the number of preceptors in that date's pool. The calendar SHALL display a note stating that preceptor coverage is based on the 24/48 rotation and not on the schedule, and does not reflect comp time, vacation, sick days, or traded shifts.

#### Scenario: Date cell shows preceptor count
- **WHEN** an admin views the scheduling calendar and a date's pool has three preceptors
- **THEN** that date's cell displays a preceptor count of three

#### Scenario: Coverage disclaimer is visible
- **WHEN** an admin views the scheduling calendar
- **THEN** the page displays a note explaining that preceptor coverage follows the 24/48 rotation and does not reflect comp, vacation, sick, or traded days

#### Scenario: Count tracks the rotation
- **WHEN** an admin navigates across dates belonging to different shifts
- **THEN** each date's preceptor count reflects that date's shift

### Requirement: Preceptor visibility for students
The student scheduling experience SHALL show the day's working preceptors when a student selects a date to request, and SHALL show the assigned preceptor on the day detail for the student's own shift when one is assigned.

#### Scenario: Student sees who is working when requesting
- **WHEN** a certified student selects a date to request a shift
- **THEN** the request experience shows the preceptors working that date

#### Scenario: Student sees the assigned preceptor
- **WHEN** a student views the detail of an approved shift that has an assigned preceptor
- **THEN** the assigned preceptor's name is displayed

#### Scenario: No assigned preceptor yet
- **WHEN** a student views a shift with no assigned preceptor
- **THEN** no preceptor is displayed for that shift

### Requirement: Per-student preceptor pairing at approval
When approving a pending student shift, an admin MAY optionally assign one preceptor from that date's available pool to the student. The pool for selection SHALL be limited to preceptors on the date's shift who are not already paired with another student on that date. Leaving the selection blank SHALL leave the shift unassigned.

#### Scenario: Approve with a preceptor
- **WHEN** an admin approving a shift selects an available preceptor for that date
- **THEN** the shift is paired with the selected preceptor

#### Scenario: Approve without a preceptor
- **WHEN** an admin approves a shift and leaves the preceptor blank
- **THEN** the shift is approved with no preceptor assigned

#### Scenario: Only the day's available pool can be selected
- **WHEN** an admin opens the preceptor selection for a date
- **THEN** the selectable preceptors are limited to that date's shift pool, excluding those already paired on that date

### Requirement: One student per preceptor per day
A preceptor SHALL be assignable to at most one student on any calendar date. The system SHALL prevent pairing a preceptor who is already assigned to another student on that date.

#### Scenario: Already-paired preceptor cannot be selected
- **WHEN** a preceptor is already paired with a student on a date
- **THEN** that preceptor is not offered for another student on the same date

#### Scenario: Second pairing is rejected
- **WHEN** an assignment would give a preceptor a second student on the same date
- **THEN** the system rejects the second pairing

### Requirement: Capacity warning on over-assignment
The system SHALL warn an admin when the number of students holding an approved shift on a date would exceed the number of preceptors in that date's pool. The warning SHALL NOT block the admin from proceeding.

#### Scenario: Warning when students exceed preceptors
- **WHEN** an admin approves a shift that would make the approved students on a date exceed the date's preceptor count
- **THEN** the system displays a warning that there are more students than available preceptors

#### Scenario: Warning does not block
- **WHEN** an admin proceeds after the capacity warning
- **THEN** the approval is recorded

#### Scenario: No warning within capacity
- **WHEN** the approved students on a date do not exceed the date's preceptor count
- **THEN** no capacity warning is displayed
