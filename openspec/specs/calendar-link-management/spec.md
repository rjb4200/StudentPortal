## Purpose

Define the administration and management of revocable, rotatable calendar feed tokens at three tiers: individual student, training site (TEI), and system-wide aggregate. Covers the admin UI panel for generating, rotating, revoking, copying, and emailing calendar links, as well as the token-based iCal endpoint that serves feeds by token lookup.

## Requirements

### Requirement: Token-based calendar feed generation
The system SHALL maintain a `calendar_feeds` table with a unique revocable token per entity for three feed types: `student` (one student's approved shifts), `training_site` (all approved shifts for students at a given training site), and `aggregate` (all approved shifts across all sites). A token SHALL be generated as a random UUID on first admin access — and for students, automatically when the student is approved. A student's token SHALL exist before the student first accesses their dashboard. The token MAY be rotated or revoked by an admin.

#### Scenario: Token generated on student approval
- **WHEN** an admin approves a pending student via the approve-student API
- **THEN** a `calendar_feeds` row with `feed_type = 'student'` and `entity_id = <student's auth_user_id>` is created with a new random UUID token
- **AND** the student's dashboard displays this token-based URL

#### Scenario: Token generated on first admin panel access
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
The system SHALL continue to serve the existing `GET /api/calendar/{studentId}.ics` endpoint unchanged for backward compatibility. The student dashboard and admin maintenance page SHALL display and promote the token-based URL from `calendar_feeds` instead of the raw student-ID URL. External subscriptions to old student-ID URLs SHALL continue working.

#### Scenario: Legacy student feed still works
- **WHEN** a calendar client requests an existing studentId-based URL
- **THEN** the feed is served exactly as before this change

### Requirement: Student dashboard displays token-based URL
The system SHALL display the token-based calendar feed URL from `calendar_feeds` in the student dashboard's Calendar Feed section. The URL SHALL be fetched from the `calendar_feeds` row matching the authenticated student's UUID as `entity_id` with `feed_type = 'student'`. If no row exists (e.g., student was certified before this feature was deployed), the system SHALL fall back to the legacy student-ID URL.

#### Scenario: Dashboard shows token URL for student with a feed row
- **WHEN** a certified student views their dashboard who has a `calendar_feeds` row
- **THEN** the Calendar Feed section displays the token-based URL (e.g., `/api/calendar/{token}.ics`)
- **AND** the Copy button copies the token-based URL

#### Scenario: Dashboard falls back for student without a feed row
- **WHEN** a certified student views their dashboard who does NOT have a `calendar_feeds` row
- **THEN** the Calendar Feed section displays the legacy student-ID URL

### Requirement: Maintenance page displays aggregate token URL
The admin maintenance page SHALL display the aggregate calendar feed URL from the `calendar_feeds` aggregate row (`feed_type = 'aggregate'`). If no aggregate row exists, the system SHALL fall back to the legacy `/api/calendar/all.ics` URL.

#### Scenario: Maintenance page shows token URL when aggregate row exists
- **WHEN** an admin views the maintenance page and a `calendar_feeds` aggregate row with an active token exists
- **THEN** the Aggregate iCal Feed section displays the token-based URL
- **AND** the Copy URL button copies the token-based URL

#### Scenario: Maintenance page falls back when no aggregate row
- **WHEN** an admin views the maintenance page and no `calendar_feeds` aggregate row exists
- **THEN** the Aggregate iCal Feed section displays the legacy `/api/calendar/all.ics` URL

### Requirement: Student RLS access to own calendar feed row
The system SHALL allow students to read their own `calendar_feeds` row via an RLS policy that permits SELECT when `feed_type = 'student'` and `entity_id` matches the authenticated user's UUID.

#### Scenario: Student reads own feed row
- **WHEN** a student queries `calendar_feeds` via the supabase client
- **THEN** only rows where `feed_type = 'student'` AND `entity_id = auth.uid()` are returned

#### Scenario: Student cannot read another student's feed row
- **WHEN** a student queries `calendar_feeds` with a different `entity_id`
- **THEN** no rows are returned

### Requirement: Backfill existing certified students
A one-time SQL script SHALL insert a `calendar_feeds` row with a fresh random UUID token for every student whose status is `'certified'` and who does not already have a `calendar_feeds` row. The script SHALL also create the aggregate feed row if it does not already exist.

#### Scenario: Backfill creates missing student tokens
- **WHEN** the backfill script is executed
- **THEN** every certified student without a `calendar_feeds` row gains one with a unique token
- **AND** students who already have a row are not affected

#### Scenario: Backfill creates aggregate row
- **WHEN** the backfill script is executed and no aggregate row exists
- **THEN** a single aggregate `calendar_feeds` row is created with a unique token

### Requirement: Shift emails include student calendar link
All shift-related transactional emails sent to students SHALL include the student's personal calendar feed URL from `calendar_feeds`. The token SHALL be auto-generated if one does not yet exist. This applies to shift approval, rejection, cancellation (by admin or student), and reminder emails.

#### Scenario: Shift approval email includes calendar link
- **WHEN** an admin approves a student's shift request
- **THEN** the approval email sent to the student includes their personal token-based calendar feed URL

#### Scenario: Shift reminder email includes calendar link
- **WHEN** the daily cron sends a shift reminder
- **THEN** the reminder email includes the student's token-based calendar feed URL

#### Scenario: Token auto-generated for shift email
- **WHEN** a shift email is about to be sent and the student has no `calendar_feeds` row
- **THEN** a token is automatically generated before the email is sent

### Requirement: Instructor class approval email includes TEI calendar link
When an admin approves a class, the system SHALL include the training site's TEI calendar feed URL in the instructor notification email. The TEI token SHALL be auto-generated if one does not yet exist.

#### Scenario: Class approval email includes TEI calendar link
- **WHEN** an admin approves a pending class
- **THEN** the instructor notification email includes the training site's token-based TEI calendar feed URL

#### Scenario: TEI token auto-generated for class approval email
- **WHEN** a class is approved and the associated training site has no `calendar_feeds` row
- **THEN** a TEI token is automatically generated before the email is sent

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
