## MODIFIED Requirements

### Requirement: Per-student iCal calendar feed
The system SHALL generate a unique absolute iCal subscription URL for each student that displays all scheduled days. The URL SHALL end in `.ics` and the calendar route SHALL resolve the associated student UUID correctly. Days SHALL appear as pending once the student signs up and SHALL update to approved as each day is approved by an admin. The dashboard SHALL present this calendar feed in a single clear utility location and SHALL NOT duplicate calendar feed copy across pending and certified dashboard states.

#### Scenario: Subscribe to personal iCal feed
- **WHEN** a student copies their unique iCal feed URL and subscribes in Google Calendar or Apple Calendar
- **THEN** the `.ics` route returns that student's calendar events with pending/approved status reflected in the event styling

#### Scenario: Calendar feed updates on approval
- **WHEN** an admin approves a pending schedule request
- **THEN** the student's iCal feed reflects the change on the next calendar client refresh, showing the day as approved

#### Scenario: Dashboard shows one calendar feed utility
- **WHEN** a pending or certified student views the dashboard
- **THEN** the dashboard displays no more than one calendar feed utility with copy and copy-link action
