## ADDED Requirements

### Requirement: Status-driven command dashboard
The student dashboard SHALL present a status-first command page that makes the student's current status, next recommended action, and key dashboard actions immediately understandable without requiring prior site training.

#### Scenario: Certified student with no scheduled shifts
- **WHEN** a certified student with no future approved or pending shifts opens the dashboard
- **THEN** the dashboard displays a status-first header showing that the student is approved for clinical rotations
- **AND** the primary action is a prominent "Schedule a Shift" call to action above secondary dashboard tools

#### Scenario: Certified student with pending requests
- **WHEN** a certified student with one or more pending shift requests opens the dashboard
- **THEN** the dashboard summarizes the pending request count
- **AND** the primary action directs the student to view pending requests or schedule another shift

#### Scenario: Certified student with upcoming approved shift
- **WHEN** a certified student has a future approved shift
- **THEN** the dashboard summary shows the next approved shift date and time
- **AND** the primary action allows the student to view shift details

### Requirement: Dashboard summary cards
The student dashboard SHALL display summary cards for account status, next scheduled shift, pending requests, and messages. Summary cards SHALL use concise labels, clear state indicators, and direct actions where applicable.

#### Scenario: Summary cards show key student state
- **WHEN** a student opens the dashboard
- **THEN** the dashboard displays account status, next shift, pending requests, and message summary cards
- **AND** each card communicates its state without requiring the student to navigate into another section first

#### Scenario: Empty states include direct actions
- **WHEN** a summary card has no data, such as no next shift or no messages
- **THEN** the card displays a concise empty state with a relevant action or explanation

### Requirement: Clear dashboard section navigation
The dashboard SHALL replace opaque local feature tabs with clearer section navigation organized around student jobs-to-be-done, such as Schedule, Preceptors & Evaluations, Messages, and Calendar Feed.

#### Scenario: Student navigates dashboard sections
- **WHEN** a student uses the dashboard navigation
- **THEN** section labels clearly describe the work available in each section
- **AND** navigation remains usable on desktop and mobile screen sizes

### Requirement: WFD-aligned dashboard presentation
The redesigned dashboard SHALL use professional WFD styling aligned with `rjb4200/wfdwebsite`, including formal red/charcoal/green visual hierarchy, strong headers, bordered action cards, and responsive layouts.

#### Scenario: Dashboard renders with WFD visual hierarchy
- **WHEN** the dashboard is viewed on desktop or mobile
- **THEN** the page uses WFD-aligned colors, spacing, card styling, and action hierarchy
- **AND** primary actions remain visually distinct from secondary actions

## MODIFIED Requirements

### Requirement: Per-student iCal calendar feed
The system SHALL generate a unique iCal subscription URL for each student that displays all scheduled days. Days SHALL appear as pending once the student signs up and SHALL update to approved as each day is approved by an admin. The dashboard SHALL present this calendar feed in a single clear utility location and SHALL NOT duplicate calendar feed copy across pending and certified dashboard states.

#### Scenario: Subscribe to personal iCal feed
- **WHEN** a student copies their unique iCal feed URL and subscribes in Google Calendar or Apple Calendar
- **THEN** all scheduled days appear as calendar events with pending/approved status reflected in the event styling

#### Scenario: Calendar feed updates on approval
- **WHEN** an admin approves a pending schedule request
- **THEN** the student's iCal feed reflects the change on the next calendar client refresh, showing the day as approved

#### Scenario: Dashboard shows one calendar feed utility
- **WHEN** a pending or certified student views the dashboard
- **THEN** the dashboard displays no more than one calendar feed utility with copy and copy-link action
