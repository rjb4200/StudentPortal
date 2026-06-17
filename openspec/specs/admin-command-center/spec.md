# admin-command-center

## Purpose

Admin dashboard interface with tabs for daily operations, analytics, and maintenance including student approval, schedule management, messaging, and roster tools.
## Requirements
### Requirement: Three-tab admin layout
The system SHALL present an admin interface with three tabs: Daily Operations, Preceptor Analytics, and Maintenance & Archive. Only users with admin role SHALL access this area.

#### Scenario: Admin navigates between tabs
- **WHEN** an authenticated admin clicks "Preceptor Analytics" tab
- **THEN** the preceptor analytics content renders and the other tab content is hidden

### Requirement: Unified action required card with visual differentiation
The admin daily operations tab SHALL display actionable items within a unified "Action Required" card. The card SHALL contain four item types, each visually differentiated by badge color and button style: Approvals (sage green badge, crimson Approve button), Schedule Requests (blue badge, crimson Approve and red Reject buttons), Cancel Requests (amber/orange badge, amber Cancel Shift button), and Quiz Flags (amber badge, secondary Acknowledge button). Items SHALL be ordered: approvals first, then schedule requests, then cancel requests, then quiz flags. Each category SHALL be sorted newest first within itself. Approval failures SHALL be displayed to the admin and SHALL NOT be represented as successful approvals unless the approval API confirms success.

#### Scenario: Approve a new student
- **WHEN** the Training Major clicks "Approve" on a pending student in the unified Action Required list and the approval API confirms success
- **THEN** the system sets `status` to `certified`, sets `access_until` to 120 days from now, sends a welcome email to the student, and refreshes the Action Required list

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
- **WHEN** no pending approvals, schedule requests, cancel requests, or quiz flags exist
- **THEN** the Action Required card displays "Nothing requires your attention"

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
The admin daily operations Student Roster SHALL display a color-coded, number-only expiration countdown badge for each student with an `access_until` value.

#### Scenario: Certified student has remaining access days
- **WHEN** an admin views the Student Roster and a student has future `access_until` value
- **THEN** the roster displays a zero-padded three-digit countdown badge such as `120`, `115`, or `001`

#### Scenario: Countdown badge communicates urgency
- **WHEN** an admin views countdown badges in the Student Roster
- **THEN** each countdown badge is colored according to remaining-day urgency

#### Scenario: Countdown badge has hover text
- **WHEN** an admin hovers over a countdown badge
- **THEN** the system displays hover text explaining that the number is the student's days remaining until access expiration

#### Scenario: Missing access expiration date
- **WHEN** an admin views a student without an `access_until` value
- **THEN** the roster does not display an expiration countdown badge for that student

### Requirement: Preceptor analytics with export
The preceptor analytics tab SHALL display a leaderboard of preceptor ratings, trend charts over time, and buttons to export data as CSV and PDF.

#### Scenario: Export analytics to CSV
- **WHEN** an admin clicks "Export to CSV"
- **THEN** the browser downloads a CSV file containing preceptor evaluation data

#### Scenario: View preceptor leaderboard
- **WHEN** an admin views the preceptor analytics tab
- **THEN** preceptors are ranked by average evaluation ratings with trend indicators

### Requirement: Aggregate iCal calendar feed
The system SHALL generate an aggregate iCal subscription URL that displays all scheduled shifts for all active students, color-coded by shift type, for admin and preceptor use.

#### Scenario: Admin subscribes to aggregate feed
- **WHEN** an admin copies the aggregate iCal feed URL and subscribes in a calendar client
- **THEN** all students' approved shifts appear as calendar events with student name and shift type visible

### Requirement: Master export and data purge
The maintenance tab SHALL provide a "Master Export" button that downloads all data. Once the download completes, a "Purge Data" form SHALL become available to clear the database.

#### Scenario: Master export enables purge
- **WHEN** an admin clicks "Master Export" and the download completes
- **THEN** the "Purge Data" button or form becomes enabled

#### Scenario: Purge data confirmation
- **WHEN** an admin clicks "Purge Data" and confirms
- **THEN** all student, schedule, evaluation, message, and note records are deleted


