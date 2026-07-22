## MODIFIED Requirements

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

### Requirement: Existing student-ID feed preserved
The system SHALL continue to serve the existing `GET /api/calendar/{studentId}.ics` endpoint unchanged for backward compatibility. The student dashboard and admin maintenance page SHALL display and promote the token-based URL from `calendar_feeds` instead of the raw student-ID URL. External subscriptions to old student-ID URLs SHALL continue working.

#### Scenario: Legacy student feed still works
- **WHEN** a student copies their calendar link from the student dashboard (which uses the studentId-based URL)
- **THEN** the feed is served exactly as before this change

## ADDED Requirements

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
