## MODIFIED Requirements

### Requirement: iCal feed regeneration on state change
Any change to a schedule record's status SHALL trigger regeneration of the affected student's iCal feed and the aggregate feed. The student's feed URL SHALL be constructed from the `calendar_feeds` token when one exists, falling back to the student-ID-based URL otherwise.

#### Scenario: Feed regenerates on approval
- **WHEN** an admin approves a pending shift
- **THEN** the student's iCal feed is regenerated with the updated status, served via the token-based URL when available

#### Scenario: Feed regenerates on new request
- **WHEN** a student submits a new shift request
- **THEN** the student's iCal feed is regenerated to include the new pending entry, served via the token-based URL when available

### Requirement: iCal feed includes time ranges
The system SHALL include the shift time range in iCal event summaries and descriptions when `start_time` and `end_time` are present on the schedule record. The feed SHALL be accessible via both the legacy student-ID URL and the token-based URL.

#### Scenario: Subscribe to personal iCal feed with times
- **WHEN** a student copies their calendar link from the student dashboard and subscribes in Google Calendar or Apple Calendar
- **THEN** all scheduled days appear as calendar events with pending/approved status reflected in the event styling, and event summaries include the time range when available

#### Scenario: Calendar feed updates on approval
- **WHEN** an admin approves a pending schedule request
- **THEN** the student's iCal feed reflects the change on the next calendar client refresh, showing the day as approved with the time range, regardless of whether the subscription uses the token URL or the legacy student-ID URL
