# admin-command-center

## Purpose

Admin dashboard interface with tabs for daily operations, analytics, and maintenance including student approval, schedule management, messaging, and roster tools.
## Requirements
### Requirement: Three-tab admin layout
The system SHALL present an admin interface with three tabs: Daily Operations, Preceptor Analytics, and Maintenance & Archive. Only users with admin role SHALL access this area.

#### Scenario: Admin navigates between tabs
- **WHEN** an authenticated admin clicks "Preceptor Analytics" tab
- **THEN** the preceptor analytics content renders and the other tab content is hidden

### Requirement: Shared admin navigation across admin pages
The system SHALL display the standard Admin Command Center navigation on admin pages, including the Admin Command Center title, hamburger menu, and primary navigation entries for Daily Operations, Registry, Preceptor Analytics, and Maintenance & Archive. Admin subpages SHALL use this shared navigation instead of redundant "Back to Admin Command Center" links when the shared navigation provides the same route back to the command center.

#### Scenario: Admin views an admin subpage
- **WHEN** an authenticated admin navigates to an admin subpage such as `/admin/setup`, `/admin/system`, `/admin/accounts`, or `/admin/students/<id>`
- **THEN** the page displays the Admin Command Center title, hamburger menu, and primary admin navigation entries
- **AND** the page does not display a redundant "Back to Admin Command Center" link above the page content

#### Scenario: Admin navigates from subpage to Daily Operations
- **WHEN** an authenticated admin clicks "Daily Operations" in the shared admin navigation from an admin subpage
- **THEN** the browser navigates to the Admin Command Center with the Daily Operations section selected

#### Scenario: Admin navigates from subpage to Registry
- **WHEN** an authenticated admin clicks "Registry" in the shared admin navigation from an admin subpage
- **THEN** the browser navigates to the Admin Command Center with the Registry section selected

#### Scenario: Admin navigates from subpage to Preceptor Analytics
- **WHEN** an authenticated admin clicks "Preceptor Analytics" in the shared admin navigation from an admin subpage
- **THEN** the browser navigates to the Admin Command Center with the Preceptor Analytics section selected

#### Scenario: Admin navigates from subpage to Maintenance & Archive
- **WHEN** an authenticated admin clicks "Maintenance & Archive" in the shared admin navigation from an admin subpage
- **THEN** the browser navigates to the Admin Command Center with the Maintenance & Archive section selected

#### Scenario: Admin opens hamburger menu from subpage
- **WHEN** an authenticated admin opens the hamburger menu from an admin subpage
- **THEN** the menu displays the same secondary admin navigation destinations available from the Admin Command Center

#### Scenario: Admin prints a printable admin page
- **WHEN** an authenticated admin prints a printable admin page such as a student profile packet
- **THEN** the shared admin navigation is omitted from the printed output

### Requirement: URL-addressable Admin Command Center sections
The Admin Command Center SHALL support opening a specific primary section from the URL. Invalid or missing section values SHALL fall back to Daily Operations.

#### Scenario: Admin opens a valid section URL
- **WHEN** an authenticated admin navigates to `/admin` with a valid section value for Daily Operations, Registry, Preceptor Analytics, or Maintenance & Archive
- **THEN** the matching Admin Command Center section is selected
- **AND** the matching section content is displayed

#### Scenario: Admin opens an invalid section URL
- **WHEN** an authenticated admin navigates to `/admin` with an invalid section value
- **THEN** the Admin Command Center selects Daily Operations
- **AND** the Daily Operations content is displayed

### Requirement: Unified action required card with visual differentiation
The admin daily operations tab SHALL display actionable items within a unified "Action Required" card. The card SHALL contain five item types, each visually differentiated by badge color and button style: Approvals for students with `status = 'pending'` and non-null `onboarding_completed_at` (sage green badge, crimson Approve button), Schedule Requests (blue badge, crimson Approve and red Reject buttons), Cancel Requests (amber/orange badge, amber Cancel Shift button), Quiz Flags (amber badge, secondary Acknowledge button), and MOU Signatures for class_mous with instructor signature but no WFEMS signature (charcoal badge, secondary "Sign as WFEMS" button). Items SHALL be ordered: approvals first, then schedule requests, then cancel requests, then quiz flags, then MOU signatures. Each category SHALL be sorted newest first within itself. Approval failures SHALL be displayed to the admin and SHALL NOT be represented as successful approvals unless the approval API confirms success.

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

#### Scenario: MOU signature item appears in unified list
- **WHEN** an instructor has signed the MOU but the WFEMS signature is not yet recorded
- **THEN** an MOU Signature item appears in the Action Required card with a charcoal or muted badge labeled "MOU", the class name, TEI, instructor name, instructor signature date, and a "Sign as WFEMS" button

#### Scenario: Admin signs MOU from unified list
- **WHEN** an admin clicks "Sign as WFEMS" on an MOU Signature item
- **THEN** the WFEMS signer details from portal settings are applied, the MOU record is updated, the completed PDF is generated and emailed, and the item is removed from the Action Required list

#### Scenario: Empty unified list
- **WHEN** no approval-ready pending students, schedule requests, cancel requests, quiz flags, or MOU signature items exist
- **THEN** the Action Required card displays "Nothing requires your attention"

### Requirement: Admin MOU notification preference
The `admin_accounts` table SHALL support a notification preference for class MOU completion emails so that only admins who opt in receive completed MOU PDF attachments.

#### Scenario: Admin enables MOU notifications
- **WHEN** an admin enables the MOU notification preference on their account
- **THEN** they receive completed MOU PDF emails when both parties have signed

#### Scenario: Admin disables MOU notifications
- **WHEN** an admin disables the MOU notification preference
- **THEN** they do not receive completed MOU PDF emails

### Requirement: Threaded messaging
The admin daily operations tab SHALL include a messaging window that supports threaded conversations between admin and individual students. Messages SHALL be scoped by `student_id` and include a sender role (`student` or `admin`).

#### Scenario: Admin sends message to student
- **WHEN** an admin selects a student from the message list, types a message, and sends
- **THEN** a message record is created with `sender = 'admin'` and `student_id` linking to the selected student, and the student sees the message in their dashboard

#### Scenario: Student sends message to admin
- **WHEN** a student sends a message from their dashboard
- **THEN** a message record is created with `sender = 'student'` and appears in the admin messaging window under that student's thread

### Requirement: Attendance tracker with no-show escalation
The admin daily operations tab SHALL display an attendance tracker with increment buttons for no-call/no-show incidents. When a student reaches 3 no-shows, a warning overlay SHALL be displayed on that student's profile. The counter SHALL be visible to the admin but SHALL NOT automatically blacklist the student.

#### Scenario: Increment no-show count
- **WHEN** an admin clicks the no-show increment button on a student's attendance tracker
- **THEN** the `no_show_count` increments by 1 and the updated count is displayed

#### Scenario: No-show threshold warning
- **WHEN** a student's `no_show_count` reaches 3
- **THEN** a warning overlay appears on the student's profile in the admin view, flagging them for admin review

### Requirement: Admin note bubbles
The admin SHALL be able to add notes to a student's record with priority levels (normal or high_accessibility). Notes SHALL appear as hover-expandable badges: blue for normal, orange for high accessibility.

#### Scenario: Add accessibility note
- **WHEN** an admin adds a note with priority `high_accessibility` to a student
- **THEN** an orange hover-expandable badge appears on that student's profile row

#### Scenario: Add normal note
- **WHEN** an admin adds a note with priority `normal` to a student
- **THEN** a blue hover-expandable badge appears on that student's profile row

### Requirement: Kill switch for student access
A prominent red toggle SHALL allow the admin to terminate a student's access. Activation SHALL prompt a native confirmation modal. A reverse switch SHALL be available for instant reactivation.

#### Scenario: Terminate student access
- **WHEN** an admin toggles the kill switch on a student and confirms the action
- **THEN** the student's access is immediately revoked and the student is redirected to `/onboarding` on their next request

#### Scenario: Reactivate student access
- **WHEN** an admin toggles the reactivation switch on a previously terminated student
- **THEN** the student's access is immediately restored and they can log in again

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

### Requirement: Preceptor analytics with export
The preceptor analytics tab SHALL display a leaderboard of preceptor ratings, trend charts over time, and buttons to export data as CSV and PDF.

#### Scenario: Export analytics to CSV
- **WHEN** an admin clicks "Export to CSV"
- **THEN** the browser downloads a CSV file containing preceptor evaluation data

#### Scenario: View preceptor leaderboard
- **WHEN** an admin views the preceptor analytics tab
- **THEN** preceptors are ranked by average evaluation ratings with trend indicators

### Requirement: Aggregate iCal calendar feed
The system SHALL generate an aggregate iCal subscription URL that displays all scheduled shifts for all active students, color-coded by shift type, for admin and preceptor use. The Maintenance & Archive tab SHALL present the aggregate feed in a dedicated calendar-feed section with clear sensitivity guidance and copy/status feedback.

#### Scenario: Admin subscribes to aggregate feed
- **WHEN** an admin copies the aggregate iCal feed URL and subscribes in a calendar client
- **THEN** all students' approved shifts appear as calendar events with student name and shift type visible

#### Scenario: Admin copies aggregate feed URL
- **WHEN** an admin clicks the copy action for the aggregate iCal feed
- **THEN** the interface copies the full URL and displays visible success or failure feedback

#### Scenario: Calendar feed sensitivity is visible
- **WHEN** an admin views the calendar-feed section
- **THEN** the interface explains that the aggregate feed exposes operational schedule information and should be shared only with authorized users

### Requirement: Master export and data purge
The maintenance tab SHALL provide a dedicated export section with a "Master Export" action that downloads all data and displays export status feedback. Once the download completes, the purge section SHALL allow an admin to request a dry-run summary before enabling final purge confirmation. The purge workflow SHALL remain separated from routine maintenance actions and SHALL require deliberate confirmation before clearing student data.

#### Scenario: Master export enables purge review
- **WHEN** an admin clicks "Master Export" and the download completes
- **THEN** the export section displays a successful completion state
- **AND** the purge section allows the admin to request or view purge dry-run details

#### Scenario: Purge data confirmation
- **WHEN** an admin reviews the purge dry-run summary, provides a reason, enters the required typed confirmation, and submits the purge
- **THEN** all student, schedule, evaluation, message, and note records are deleted
- **AND** the interface displays progress and final completion feedback

#### Scenario: Purge remains blocked before export
- **WHEN** an admin has not completed a master export in the current maintenance session
- **THEN** the purge execution action remains disabled and explains that a master export is required first

### Requirement: Abandoned registration cleanup
The Maintenance & Archive tab SHALL display an abandoned-registration cleanup view listing students with `status = 'pending'` and `onboarding_completed_at IS NULL`. The view SHALL show all incomplete pending records, visually flag records older than 24 hours, and allow admins to delete abandoned records through the safe student deletion API only after reviewing the record, entering an admin reason, and completing deliberate confirmation.

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
- **WHEN** an admin opens the delete confirmation for an abandoned registration, enters a reason, completes the required typed confirmation, and submits
- **THEN** the safe student deletion API deletes the student row and any cascaded data
- **AND** the cleanup view refreshes without the deleted record
- **AND** the interface displays completion or error feedback

### Requirement: Maintenance workflows are separated by risk
The Maintenance & Archive tab SHALL present separate sections for export, archive cleanup, purge, calendar feeds, and audit visibility. Routine and informational actions SHALL be visually separated from destructive actions. High-risk actions SHALL appear in a distinct danger zone that is not visually grouped with routine admin workflows.

#### Scenario: Admin views maintenance sections
- **WHEN** an admin opens the Maintenance & Archive tab
- **THEN** the page displays distinct sections for export, archive cleanup, purge, calendar feeds, and audit visibility
- **AND** destructive purge controls are visually separated from routine export and calendar-feed controls

#### Scenario: High-risk actions are isolated
- **WHEN** an admin scans the Maintenance & Archive tab
- **THEN** high-risk destructive actions are grouped in a clearly labeled danger zone using warning/destructive visual treatment

### Requirement: Maintenance UI uses WFD safety branding
The Maintenance & Archive tab SHALL use WFD visual branding to communicate administrative risk. Crimson SHALL indicate destructive or authority actions, gold SHALL indicate caution or review, sage SHALL indicate safe or completed states, and charcoal SHALL frame command/administrative context.

#### Scenario: Risk states use branded colors
- **WHEN** the maintenance interface shows destructive, caution, success, and command states
- **THEN** those states use WFD crimson, gold, sage, and charcoal styling consistently
