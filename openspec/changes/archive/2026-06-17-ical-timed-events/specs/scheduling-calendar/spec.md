## MODIFIED Requirements

### Requirement: iCal feed includes time ranges
The system SHALL render shift events as timed calendar events at their scheduled hours when `start_time` and `end_time` are present on the schedule record, using the `TZID=America/New_York` timezone identifier with the format `YYYYMMDDTHHMMSS`. When `start_time` and `end_time` are not present, the system SHALL fall back to all-day events using `VALUE=DATE`. Shifts whose end time 24-hour value is less than or equal to the start time 24-hour value SHALL have their end date advanced by one day. Event summaries, descriptions, and color coding SHALL remain unchanged.

#### Scenario: Day shift renders at scheduled hours
- **WHEN** a student subscribes to their iCal feed and a Day shift (7:00 AM to 7:00 PM) exists
- **THEN** the calendar event appears at the 7 AM – 7 PM time block on the scheduled date in the calendar client

#### Scenario: Night shift spans midnight
- **WHEN** a student subscribes to their iCal feed and a Night shift (7:00 PM to 7:00 AM) exists
- **THEN** the calendar event spans from 7:00 PM on the scheduled date to 7:00 AM the following day

#### Scenario: Full shift spans midnight
- **WHEN** a student subscribes to their iCal feed and a Full shift (7:00 AM to 7:00 AM) exists
- **THEN** the calendar event spans from 7:00 AM on the scheduled date to 7:00 AM the following day

#### Scenario: Custom shift renders at scheduled hours
- **WHEN** a student subscribes to their iCal feed and a Custom shift with specific start and end times exists
- **THEN** the calendar event occupies the exact time block specified by `start_time` and `end_time`

#### Scenario: Shift without times falls back to all-day
- **WHEN** a student subscribes to their iCal feed and a legacy shift without `start_time` and `end_time` exists
- **THEN** the calendar event appears as an all-day event on the scheduled date

#### Scenario: Aggregate feed shows timed events
- **WHEN** an admin subscribes to the aggregate iCal feed
- **THEN** all approved shifts with times appear at their scheduled time blocks with the student's name visible

#### Scenario: Calendar feed updates on approval
- **WHEN** an admin approves a pending schedule request
- **THEN** the student's iCal feed reflects the change on the next calendar client refresh, showing the day as approved with the scheduled time block
