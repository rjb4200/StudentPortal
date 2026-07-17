## MODIFIED Requirements

### Requirement: Shift signup with time selectors
The shift signup modal SHALL present three options: Day Shift (locked to 7:00 AM - 7:00 PM), Extended Shift (stored as `shift_type = 'full'` and locked to 7:00 AM - 10:00 PM), and Custom. Custom start and end dropdowns SHALL offer only times from 7:00 AM through 10:00 PM, SHALL default to a 0700 start, and SHALL require the end time to be later than the start time. Student-facing surfaces SHALL display times in 12-hour AM/PM format. Admin-facing surfaces SHALL display times in 24-hour format.

#### Scenario: Student selects Day Shift
- **WHEN** a student selects Day Shift and confirms
- **THEN** the schedule is created with `shift_type = 'day'`, `start_time = '7:00 AM'`, and `end_time = '7:00 PM'

#### Scenario: Student selects Extended Shift
- **WHEN** a student selects Extended Shift and confirms
- **THEN** the schedule is created with `shift_type = 'full'`, `start_time = '7:00 AM'`, and `end_time = '10:00 PM'

#### Scenario: Student selects Custom shift with allowed hours
- **WHEN** a student selects Custom and chooses an end time later than the start time within the 0700-2200 window
- **THEN** the schedule is created with `shift_type = 'custom'` and the selected times stored in 12-hour format

#### Scenario: Student attempts an overnight or after-2200 custom shift
- **WHEN** a student submits a custom start or end time outside 0700-2200, or an end time not later than the start time
- **THEN** the request is rejected
