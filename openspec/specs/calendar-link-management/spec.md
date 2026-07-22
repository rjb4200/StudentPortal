## Purpose

Define the administration and management of revocable, rotatable calendar feed tokens at three tiers: individual student, training site (TEI), and system-wide aggregate. Covers the admin UI panel for generating, rotating, revoking, copying, and emailing calendar links, as well as the token-based iCal endpoint that serves feeds by token lookup.

## Requirements

### Requirement: Token-based calendar feed generation
The system SHALL maintain a `calendar_feeds` table with a unique revocable token per entity for three feed types: `student` (one student's approved shifts), `training_site` (all approved shifts for students at a given training site), and `aggregate` (all approved shifts across all sites). A token SHALL be generated as a random UUID on first admin access and MAY be rotated or revoked by an admin.

#### Scenario: Token generated on first access
- **WHEN** an admin selects a student or training site in the Calendar Links panel that has no existing calendar feed row
- **THEN** a `calendar_feeds` row is created with a new random UUID token and `generated_at` set to the current timestamp

#### Scenario: Token rotation
- **WHEN** an admin clicks "Rotate" for an active calendar feed
- **THEN** a new random UUID token replaces the existing token and `generated_at` is updated
- **AND** the previous token immediately stops serving the feed

#### Scenario: Token revocation
- **WHEN** an admin clicks "Revoke" for an active calendar feed
- **THEN** the token is set to NULL and `generated_at` is set to NULL
- **AND** the feed endpoint returns 404 for the revoked token

#### Scenario: Aggregate feed has exactly one row
- **WHEN** an admin accesses the aggregate feed for the first time
- **THEN** a single `calendar_feeds` row with `feed_type = 'aggregate'` and `entity_id = NULL` is created
- **AND** no second aggregate row can be created

### Requirement: Token-based iCal endpoint
The system SHALL serve iCal feeds at `GET /api/calendar/{token}.ics` by looking up the token in `calendar_feeds` and dispatching to the appropriate query based on `feed_type`. The endpoint SHALL return a valid `VCALENDAR` with `VEVENT` entries for all approved schedules matching the feed scope. The endpoint SHALL return 404 when the token is NULL or not found.

#### Scenario: Student feed returns only that student's approved shifts
- **WHEN** a calendar client requests the feed with a valid student-type token
- **THEN** the response contains iCal events for all approved schedules belonging to the associated student
- **AND** no schedules from other students are included

#### Scenario: TEI feed returns all approved shifts for that training site
- **WHEN** a calendar client requests the feed with a valid training_site-type token
- **THEN** the response contains iCal events for all approved schedules of students linked to the associated training site
- **AND** schedules from students at other training sites are excluded

#### Scenario: Aggregate feed returns all approved shifts
- **WHEN** a calendar client requests the feed with a valid aggregate-type token
- **THEN** the response contains iCal events for all approved schedules across all students and training sites

#### Scenario: Revoked token returns 404
- **WHEN** a calendar client requests the feed with a token that has been revoked (NULL)
- **THEN** the endpoint returns HTTP 404

#### Scenario: Invalid token returns 404
- **WHEN** a calendar client requests the feed with a token that does not exist in `calendar_feeds`
- **THEN** the endpoint returns HTTP 404

### Requirement: Existing student-ID feed preserved
The system SHALL continue to serve the existing `GET /api/calendar/{studentId}.ics` endpoint unchanged, using the raw student UUID for lookup. This endpoint SHALL NOT require a `calendar_feeds` token.

#### Scenario: Legacy student feed still works
- **WHEN** a student copies their calendar link from the student dashboard (which uses the studentId-based URL)
- **THEN** the feed is served exactly as before this change

### Requirement: Calendar Links admin panel
The system SHALL provide a collapsible "Calendar Links" management panel at the bottom of the admin Schedule Calendar tab (`/admin?tab=calendar`). The panel SHALL be closed by default and SHALL open when the admin clicks to expand it.

#### Scenario: Panel is closed by default
- **WHEN** an admin navigates to the Calendar tab
- **THEN** the Calendar Links panel is collapsed and does not obstruct the scheduling interface

#### Scenario: Admin expands the panel
- **WHEN** an admin clicks the expand control for Calendar Links
- **THEN** the panel opens to reveal the feed type selector and controls

### Requirement: Feed type and entity selection
The Calendar Links panel SHALL include a feed type selector with three options: Student, TEI, and Admin. For Student type, a searchable student dropdown SHALL appear. For TEI type, a searchable training site dropdown SHALL appear. For Admin type, no entity selector SHALL be shown.

#### Scenario: Student feed type shows student selector
- **WHEN** an admin selects "Student" feed type
- **THEN** a searchable dropdown of students is displayed

#### Scenario: TEI feed type shows site selector
- **WHEN** an admin selects "TEI" feed type
- **THEN** a searchable dropdown of training sites is displayed

#### Scenario: Admin feed type hides entity selector
- **WHEN** an admin selects "Admin" feed type
- **THEN** no entity selector is displayed and the aggregate feed token is loaded automatically

#### Scenario: Selecting an entity loads its feed state
- **WHEN** an admin selects a specific student or training site from the dropdown
- **THEN** the panel displays that entity's current feed status (active, revoked, or never generated) and the applicable controls

### Requirement: Copy calendar link
The system SHALL display the full calendar feed URL for the selected entity and SHALL provide a "Copy Link" button that copies the URL to the clipboard. The Copy button SHALL be disabled when no token exists.

#### Scenario: Copy active feed URL
- **WHEN** an admin clicks "Copy Link" for a feed with an active token
- **THEN** the full `.ics` URL is copied to the clipboard

#### Scenario: Copy disabled when no token exists
- **WHEN** a feed has no token (never generated or revoked)
- **THEN** the "Copy Link" button is disabled

### Requirement: Rotate calendar token
The system SHALL provide a "Rotate" button that replaces the current token with a new random UUID. The previous token SHALL immediately become invalid. The button SHALL be visible only when an active token exists.

#### Scenario: Rotate replaces token
- **WHEN** an admin clicks "Rotate" for a feed with an active token
- **THEN** a new token is generated, `generated_at` is updated, and the displayed URL changes

#### Scenario: Rotate hidden when no token exists
- **WHEN** a feed has no token
- **THEN** the "Rotate" button is not displayed

### Requirement: Revoke calendar token
The system SHALL provide a "Revoke" button that clears the token, making the feed inaccessible. The button SHALL be visible only when an active token exists. Revocation SHALL require confirmation.

#### Scenario: Revoke clears token
- **WHEN** an admin clicks "Revoke" and confirms the action
- **THEN** the token is set to NULL and `generated_at` is set to NULL
- **AND** the feed URL stops working

#### Scenario: Revoke requires confirmation
- **WHEN** an admin clicks "Revoke"
- **THEN** a confirmation dialog is displayed before the token is cleared

#### Scenario: Revoke hidden when no token exists
- **WHEN** a feed has no token
- **THEN** the "Revoke" button is not displayed

### Requirement: Email calendar link
The system SHALL provide an email input field and "Send Link" button in the Calendar Links panel. When the admin provides a recipient email address and clicks Send, the system SHALL send a WFD-branded email containing the calendar feed URL and instructions for subscribing in Google Calendar, Apple Calendar, or Outlook. The email SHALL include a link to Google's calendar subscribe documentation. After successful send, `emailed_at` SHALL be updated.

#### Scenario: Send calendar link email
- **WHEN** an admin enters a recipient email, the feed has an active token, and they click "Send Link"
- **THEN** a WFD-branded email is sent to the recipient with the feed URL, subscribe instructions, and a link to Google's subscribe guide
- **AND** `emailed_at` is updated to the current timestamp

#### Scenario: Send disabled when no token exists
- **WHEN** a feed has no token
- **THEN** the "Send Link" button is disabled

#### Scenario: Send disabled when no recipient entered
- **WHEN** the recipient email field is empty
- **THEN** the "Send Link" button is disabled

#### Scenario: Email delivery is best-effort
- **WHEN** the email provider is unreachable during a send attempt
- **THEN** an error message is displayed to the admin
- **AND** the feed token remains unchanged

### Requirement: Resend calendar link
The system SHALL provide a "Resend" button when a calendar link has previously been emailed. The Resend button SHALL use the same recipient email and SHALL update `emailed_at` on success. The button SHALL be visible only when `emailed_at` is not null and an active token exists.

#### Scenario: Resend updates timestamp
- **WHEN** an admin clicks "Resend" for a feed with an active token and a previous `emailed_at`
- **THEN** the calendar link email is sent to the previously used recipient
- **AND** `emailed_at` is updated to the current timestamp

#### Scenario: Resend hidden when never emailed
- **WHEN** a feed has never been emailed (`emailed_at` is NULL)
- **THEN** the "Resend" button is not displayed

### Requirement: Last emailed timestamp display
The system SHALL display the `emailed_at` timestamp in a human-readable format when the feed has been emailed at least once.

#### Scenario: Last emailed timestamp shown
- **WHEN** a feed has `emailed_at` set
- **THEN** the panel displays "Last emailed: [date]" in a human-readable format

#### Scenario: No timestamp when never emailed
- **WHEN** a feed has `emailed_at = NULL`
- **THEN** no last-emailed timestamp is displayed

### Requirement: Admin-only access control
All calendar feed management API routes SHALL require admin authentication via the existing admin role check. The Calendar Links panel SHALL only render for authenticated admin users.

#### Scenario: Non-admin cannot access management routes
- **WHEN** a non-admin user attempts to call any `/api/admin/calendar-feeds` endpoint
- **THEN** the API returns HTTP 401 or 403

#### Scenario: Admin can access all management routes
- **WHEN** an authenticated admin user calls any `/api/admin/calendar-feeds` endpoint
- **THEN** the API processes the request normally

### Requirement: Calendar feed email template
The system SHALL render calendar link emails using the existing WFD-branded HTML template with crimson header, logo, charcoal divider, and credential-box body. The email SHALL include the full `.ics` feed URL and a link to `https://support.google.com/calendar/answer/37118` for subscribe instructions. The from address SHALL be `students@winchesterfireems.com`.

#### Scenario: Calendar link email matches brand
- **WHEN** a calendar link email is sent
- **THEN** it uses the same WFD template as all other transactional emails with crimson header, WFD logo, charcoal divider, branded CTA button, and `students@winchesterfireems.com` from address

#### Scenario: Calendar link email contains subscribe instructions
- **WHEN** a calendar link email is rendered
- **THEN** the body contains the feed URL, a brief instruction to add it to Google Calendar/Apple Calendar/Outlook, and a hyperlink to the Google Calendar subscribe documentation
