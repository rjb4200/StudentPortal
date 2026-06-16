## Purpose

Define the student dashboard experience including calendar scheduling, preceptor gallery, clinical evaluations, iCal feeds, and access control.
## Requirements
### Requirement: Calendar shift scheduling
The system SHALL display a calendar grid where students can click a date cell and select a shift type (Full Shift, Day, Night) from a modal. Submitted requests SHALL immediately show as "Pending" with yellow/striped styling. Approved shifts SHALL display solid crimson red.

#### Scenario: Request a shift
- **WHEN** a student clicks a future date cell and selects "Full Shift" from the modal
- **THEN** a schedule record is created with status `pending` and the date cell displays yellow/striped styling

#### Scenario: View approved shift
- **WHEN** a student views the calendar and an admin has approved a previously requested shift
- **THEN** the date cell displays solid crimson red styling (`#B61C20`)

#### Scenario: View rejected shift
- **WHEN** a student views the calendar and an admin has rejected a previously requested shift
- **THEN** the date cell displays the rejected state with appropriate styling

### Requirement: Preceptor gallery
The system SHALL display a gallery of preceptor cards below the calendar grid. Each card SHALL include the preceptor's professional headshot, short bio, station/unit assignment, and interactive badges representing specialty tags (e.g., "A-Shift", "Medic 1", "Trauma").

#### Scenario: Browsing preceptor gallery
- **WHEN** a certified student loads the dashboard
- **THEN** the preceptor gallery displays all active preceptors with their images, bios, station assignments, and specialty tag badges

### Requirement: Clinical evaluation submission
The system SHALL present a standardized evaluation form with 1-5 rating scales for clinical performance, teaching quality, safety adherence, and overall experience, plus an open comments field. The evaluation SHALL be linked to both the student and the selected preceptor.

#### Scenario: Submit evaluation
- **WHEN** a student selects a preceptor, rates all four categories, optionally adds comments, and submits
- **THEN** an evaluation record is created with all ratings and linked to the student and preceptor

#### Scenario: Flagged evaluation
- **WHEN** a student submits an evaluation with `overall_rating` less than 3
- **THEN** the `is_flagged` field is set to `true` on the evaluation record

#### Scenario: Incomplete evaluation submission
- **WHEN** a student submits the evaluation form with any rating category unset
- **THEN** the system blocks submission and highlights the missing fields

### Requirement: Per-student iCal calendar feed
The system SHALL generate a unique iCal subscription URL for each student that displays all scheduled days. Days SHALL appear as pending once the student signs up and SHALL update to approved as each day is approved by an admin.

#### Scenario: Subscribe to personal iCal feed
- **WHEN** a student copies their unique iCal feed URL and subscribes in Google Calendar or Apple Calendar
- **THEN** all scheduled days appear as calendar events with pending/approved status reflected in the event styling

#### Scenario: Calendar feed updates on approval
- **WHEN** an admin approves a pending schedule request
- **THEN** the student's iCal feed reflects the change on the next calendar client refresh, showing the day as approved

### Requirement: Dashboard access control
The system SHALL redirect students to `/login` with a `reason` query parameter indicating the specific access-denial cause if they are not certified, if their access has expired, or if they have been blacklisted or terminated by an admin.

#### Scenario: Uncertified student redirected
- **WHEN** a student who has not completed the knowledge gate navigates to `/dashboard`
- **THEN** the system redirects them to `/login?reason=not-registered`

#### Scenario: Expired student redirected
- **WHEN** a student whose `access_until` timestamp has passed navigates to `/dashboard`
- **THEN** the system redirects them to `/login?reason=expired`

#### Scenario: Blacklisted or terminated student redirected
- **WHEN** a student flagged as blacklisted or terminated navigates to `/dashboard`
- **THEN** the system redirects them to `/login?reason=blacklisted`

#### Scenario: Archived student redirected
- **WHEN** a student with status `archived` navigates to `/dashboard`
- **THEN** the system redirects them to `/login?reason=archived`

