## MODIFIED Requirements

### Requirement: Calendar shift scheduling with time selectors
The system SHALL display a calendar grid where students can click a date cell and select Day Shift, Extended Shift, or Custom with start and end times. Day Shift SHALL be 7:00 AM-7:00 PM. Extended Shift SHALL use the existing `full` schedule type and be 7:00 AM-10:00 PM. Custom requests SHALL be limited to 7:00 AM through 10:00 PM and end later than they start. Submitted requests SHALL immediately show as Pending with yellow/striped styling and display the time range in 12-hour AM/PM format. Approved shifts SHALL display solid crimson red with the time range.

#### Scenario: Request an Extended Shift
- **WHEN** a student selects Extended Shift and confirms
- **THEN** a pending schedule record is created with a 7:00 AM start and 10:00 PM end

#### Scenario: Reject after-hours request
- **WHEN** a caller submits a student schedule request outside the 0700-2200 window
- **THEN** the request is rejected before a schedule record is created
