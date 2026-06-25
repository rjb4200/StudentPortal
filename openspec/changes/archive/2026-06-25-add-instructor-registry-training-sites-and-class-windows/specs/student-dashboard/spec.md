## MODIFIED Requirements

### Requirement: Calendar shift scheduling
The system SHALL display a calendar grid where students can click an eligible date cell and select a shift type (Full Shift, Day, Night) from a modal. Submitted requests SHALL immediately show as "Pending" with yellow/striped styling. Approved shifts SHALL display solid crimson red. For students linked to a training class, dates before the selected class `class_start_date` and after `ride_time_end_date` SHALL be greyed out, non-selectable, and rejected by the schedule creation write path.

#### Scenario: Request a shift
- **WHEN** a certified class-linked student clicks a future date cell inside their selected class date window and selects "Full Shift" from the modal
- **THEN** a schedule record is created with status `pending` and the date cell displays yellow/striped styling

#### Scenario: View approved shift
- **WHEN** a student views the calendar and an admin has approved a previously requested shift
- **THEN** the date cell displays solid crimson red styling (`#B61C20`)

#### Scenario: View rejected shift
- **WHEN** a student views the calendar and an admin has rejected a previously requested shift
- **THEN** the date cell displays the rejected state with appropriate styling

#### Scenario: Date before class start is unavailable
- **WHEN** a certified class-linked student views a date before the selected class `class_start_date`
- **THEN** the calendar greys out the date
- **AND** clicking the date does not open the schedule modal

#### Scenario: Date after ride-time end is unavailable
- **WHEN** a certified class-linked student views a date after the selected class `ride_time_end_date`
- **THEN** the calendar greys out the date
- **AND** clicking the date does not open the schedule modal

#### Scenario: Out-of-window schedule insert rejected
- **WHEN** a certified class-linked student attempts to create a schedule outside the selected class date window
- **THEN** the schedule creation write path rejects the request
- **AND** no schedule row is created
