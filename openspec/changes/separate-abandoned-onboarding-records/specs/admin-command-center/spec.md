## MODIFIED Requirements

### Requirement: Unified action required card with visual differentiation
The admin daily operations tab SHALL display actionable items within a unified "Action Required" card. The card SHALL contain four item types, each visually differentiated by badge color and button style: Approvals for students with `status = 'pending'` and non-null `onboarding_completed_at` (sage green badge, crimson Approve button), Schedule Requests (blue badge, crimson Approve and red Reject buttons), Cancel Requests (amber/orange badge, amber Cancel Shift button), and Quiz Flags (amber badge, secondary Acknowledge button). Items SHALL be ordered: approvals first, then schedule requests, then cancel requests, then quiz flags. Each category SHALL be sorted newest first within itself. Approval failures SHALL be displayed to the admin and SHALL NOT be represented as successful approvals unless the approval API confirms success.

#### Scenario: Approve a new student
- **WHEN** the Training Major clicks "Approve" on a pending student in the unified Action Required list and the approval API confirms success
- **THEN** the system sets `status` to `certified`, sets `access_until` to 120 days from now, sends a welcome email to the student, and refreshes the Action Required list

#### Scenario: Incomplete pending student does not appear for approval
- **WHEN** a student has `status = 'pending'` and `onboarding_completed_at IS NULL`
- **THEN** the student does not appear as an Approval item in Action Required

#### Scenario: Approval-ready pending student appears for approval
- **WHEN** a student has `status = 'pending'` and `onboarding_completed_at IS NOT NULL`
- **THEN** the student appears as an Approval item in Action Required

#### Scenario: Approval failure is visible
- **WHEN** the Training Major clicks "Approve" on a pending student and the approval API fails
- **THEN** the Action Required card displays a useful error message to the admin and does not treat the approval as successful

#### Scenario: Approve a schedule request
- **WHEN** an admin clicks "Approve" on a schedule request in the unified list
- **THEN** the schedule status changes to `approved`

#### Scenario: Reject a schedule request
- **WHEN** an admin clicks "Reject" on a schedule request in the unified list
- **THEN** the schedule status changes to `rejected`

#### Scenario: Visual differentiation of item types
- **WHEN** an admin views the Action Required card and multiple item types are present
- **THEN** each item type displays a distinct badge color and button style so the admin can immediately identify what kind of action is needed

#### Scenario: Cancel request appears in unified list
- **WHEN** a student cancels an approved shift
- **THEN** a Cancel Request item appears in the Action Required card with an amber badge labeled "Cancel Request", the student name, date, time, any student note, and an amber-colored "Cancel Shift" button

#### Scenario: Approved shifts not in action required
- **WHEN** an admin views the Action Required card
- **THEN** approved schedules do not appear — they are managed exclusively in the Shift Management section

#### Scenario: Acknowledge a quiz flag
- **WHEN** an admin clicks "Acknowledge" on a quiz flag in the unified list
- **THEN** the flag is marked as acknowledged and removed from the active list

#### Scenario: Empty unified list
- **WHEN** no approval-ready pending students, schedule requests, cancel requests, or quiz flags exist
- **THEN** the Action Required card displays "Nothing requires your attention"

### Requirement: Student roster expiration countdown badge
The admin daily operations Student Roster SHALL display certified students only and SHALL exclude incomplete pending registrations and approval-ready pending students. The roster SHALL display a color-coded, number-only expiration countdown badge for each certified student with an `access_until` value.

#### Scenario: Certified student has remaining access days
- **WHEN** an admin views the Student Roster and a certified student has future `access_until` value
- **THEN** the roster displays a zero-padded three-digit countdown badge such as `120`, `115`, or `001`

#### Scenario: Countdown badge communicates urgency
- **WHEN** an admin views countdown badges in the Student Roster
- **THEN** each countdown badge is colored according to remaining-day urgency

#### Scenario: Countdown badge has hover text
- **WHEN** an admin hovers over a countdown badge
- **THEN** the system displays hover text explaining that the number is the student's days remaining until access expiration

#### Scenario: Missing access expiration date
- **WHEN** an admin views a certified student without an `access_until` value
- **THEN** the roster does not display an expiration countdown badge for that student

#### Scenario: Pending student excluded from roster
- **WHEN** an admin views the Student Roster and a student has `status = 'pending'`
- **THEN** that student does not appear in the Student Roster regardless of `onboarding_completed_at`

## ADDED Requirements

### Requirement: Abandoned registration cleanup
The Maintenance & Archive tab SHALL display an abandoned-registration cleanup view listing students with `status = 'pending'` and `onboarding_completed_at IS NULL`. The view SHALL show all incomplete pending records, visually flag records older than 24 hours, and allow admins to delete abandoned records through the existing safe student deletion API.

#### Scenario: All incomplete pending registrations are listed
- **WHEN** an admin opens Maintenance & Archive
- **THEN** the abandoned-registration cleanup view lists students with `status = 'pending'` and `onboarding_completed_at IS NULL`

#### Scenario: Approval-ready students are excluded from cleanup
- **WHEN** a student has `status = 'pending'` and `onboarding_completed_at IS NOT NULL`
- **THEN** the student does not appear in the abandoned-registration cleanup view

#### Scenario: Certified students are excluded from cleanup
- **WHEN** a student has `status = 'certified'`
- **THEN** the student does not appear in the abandoned-registration cleanup view

#### Scenario: Stale abandoned registration is flagged
- **WHEN** an incomplete pending registration is older than 24 hours
- **THEN** the cleanup view visually flags the record as stale or 24h+

#### Scenario: Same-day abandoned registration remains visible
- **WHEN** an incomplete pending registration is less than 24 hours old
- **THEN** the cleanup view still lists the record without the stale warning

#### Scenario: Admin deletes abandoned registration
- **WHEN** an admin confirms deletion for an abandoned registration
- **THEN** the existing safe student deletion API deletes the student row and any cascaded data
- **AND** the cleanup view refreshes without the deleted record
