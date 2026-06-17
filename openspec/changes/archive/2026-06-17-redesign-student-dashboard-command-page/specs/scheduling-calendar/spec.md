## ADDED Requirements

### Requirement: Discoverable shift scheduling action
The dashboard SHALL make shift scheduling discoverable through a prominent primary action for certified students in addition to calendar date selection. Students SHALL NOT need to know in advance that clicking a calendar date is the only way to request a shift.

#### Scenario: Primary schedule action is visible
- **WHEN** a certified student opens the dashboard
- **THEN** a prominent "Schedule a Shift" action is visible before or alongside the schedule section
- **AND** the action leads the student into the existing shift request flow

#### Scenario: Calendar date selection remains available
- **WHEN** a certified student clicks an eligible future date on the calendar
- **THEN** the existing shift request flow remains available for that date

#### Scenario: Pending student cannot schedule shifts
- **WHEN** a pending student views the dashboard
- **THEN** schedule request actions are not presented as available
- **AND** the dashboard explains that scheduling unlocks after approval
