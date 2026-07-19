## MODIFIED Requirements

### Requirement: Three-tab admin layout
The system SHALL present an admin interface with five primary tabs: Daily Operations, Calendar, Messages, Registry, and Maintenance & Archive. Preceptor Analytics SHALL be accessible from the hamburger secondary menu. Only users with admin role SHALL access this area.

#### Scenario: Admin navigates between tabs
- **WHEN** an authenticated admin clicks "Messages" tab
- **THEN** the messages content renders and the other tab content is hidden

### Requirement: Shared admin navigation across admin pages
The system SHALL display the standard Admin Command Center navigation on admin pages, including the Admin Command Center title, hamburger menu, and primary navigation entries for Daily Operations, Calendar, Messages, Registry, and Maintenance & Archive. Preceptor Analytics SHALL appear in the hamburger secondary menu. Admin subpages SHALL use this shared navigation instead of redundant "Back to Admin Command Center" links when the shared navigation provides the same route back to the command center.

#### Scenario: Admin views an admin subpage
- **WHEN** an authenticated admin navigates to an admin subpage such as `/admin/setup`, `/admin/system`, `/admin/accounts`, or `/admin/students/<id>`
- **THEN** the page displays the Admin Command Center title, hamburger menu, and primary admin navigation entries for Daily Operations, Calendar, Messages, Registry, and Maintenance & Archive
- **AND** the page does not display a redundant "Back to Admin Command Center" link above the page content

#### Scenario: Admin navigates from subpage to Daily Operations
- **WHEN** an authenticated admin clicks "Daily Operations" in the shared admin navigation from an admin subpage
- **THEN** the browser navigates to the Admin Command Center with the Daily Operations section selected

#### Scenario: Admin navigates from subpage to Calendar
- **WHEN** an authenticated admin clicks "Calendar" in the shared admin navigation from an admin subpage
- **THEN** the browser navigates to the Admin Command Center with the Calendar section selected

#### Scenario: Admin navigates from subpage to Messages
- **WHEN** an authenticated admin clicks "Messages" in the shared admin navigation from an admin subpage
- **THEN** the browser navigates to the Admin Command Center with the Messages section selected

#### Scenario: Admin navigates from subpage to Registry
- **WHEN** an authenticated admin clicks "Registry" in the shared admin navigation from an admin subpage
- **THEN** the browser navigates to the Admin Command Center with the Registry section selected

#### Scenario: Admin navigates from subpage to Maintenance & Archive
- **WHEN** an authenticated admin clicks "Maintenance & Archive" in the shared admin navigation from an admin subpage
- **THEN** the browser navigates to the Admin Command Center with the Maintenance & Archive section selected

#### Scenario: Preceptor Analytics accessible from hamburger
- **WHEN** an authenticated admin opens the hamburger menu
- **THEN** "Preceptor Analytics" appears as a secondary navigation destination
- **AND** clicking it navigates to the Admin Command Center with the Preceptor Analytics section selected

#### Scenario: Admin opens hamburger menu from subpage
- **WHEN** an authenticated admin opens the hamburger menu from an admin subpage
- **THEN** the menu displays the same secondary admin navigation destinations available from the Admin Command Center including Preceptor Analytics

#### Scenario: Admin prints a printable admin page
- **WHEN** an authenticated admin prints a printable admin page such as a student profile packet
- **THEN** the shared admin navigation is omitted from the printed output

### Requirement: URL-addressable Admin Command Center sections
The Admin Command Center SHALL support opening a specific primary section from the URL. Valid section values SHALL include Daily Operations, Calendar, Messages, Registry, Preceptor Analytics, and Maintenance & Archive. Invalid or missing section values SHALL fall back to Daily Operations. Preceptor Analytics SHALL remain URL-addressable via `?tab=analytics` even though it is not a primary tab.

#### Scenario: Admin opens a valid section URL
- **WHEN** an authenticated admin navigates to `/admin` with a valid section value for Daily Operations, Calendar, Messages, Registry, Preceptor Analytics, or Maintenance & Archive
- **THEN** the matching Admin Command Center section is selected
- **AND** the matching section content is displayed

#### Scenario: Admin opens an invalid section URL
- **WHEN** an authenticated admin navigates to `/admin` with an invalid section value
- **THEN** the Admin Command Center selects Daily Operations
- **AND** the Daily Operations content is displayed

### Requirement: Unified action required card with visual differentiation
The admin daily operations tab SHALL display actionable items within a unified "Action Required" card. The card SHALL contain six item types, each visually differentiated by badge color and button style: Approvals for students with `status = 'pending'` and non-null `onboarding_completed_at` (sage green badge, crimson Approve button), Schedule Requests (blue badge, crimson Approve and red Reject buttons), Cancel Requests (amber/orange badge, amber Cancel Shift button), Quiz Flags (amber badge, secondary Acknowledge button), MOU Signatures for class_mous with instructor signature but no WFEMS signature (charcoal badge, secondary "Sign as WFEMS" button), and Unread Messages (crimson badge, View Messages button) showing the count of student threads with unread messages for the authenticated admin. Items SHALL be ordered: approvals first, then schedule requests, then cancel requests, then quiz flags, then unread messages, then MOU signatures. Each category SHALL be sorted newest first within itself. Approval failures SHALL be displayed to the admin and SHALL NOT be represented as successful approvals unless the approval API confirms success.

#### Scenario: Unread messages appear in Action Required
- **WHEN** one or more student threads have unread messages for the authenticated admin
- **THEN** the Action Required card displays an Unread Messages item with a crimson badge and the count of unread threads
- **AND** a "View Messages" button navigates to the Messages tab

#### Scenario: No unread messages in Action Required
- **WHEN** no student threads have unread messages for the authenticated admin
- **THEN** the Unread Messages item does not appear in the Action Required card

#### Scenario: View Messages navigates to messages tab
- **WHEN** an admin clicks "View Messages" on the Unread Messages item in Action Required
- **THEN** the browser navigates to the Messages tab
- **AND** the messages tab displays the thread list

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
- **WHEN** no approval-ready pending students, schedule requests, cancel requests, quiz flags, unread message threads, or MOU signature items exist
- **THEN** the Action Required card displays "Nothing requires your attention"

### Requirement: Threaded messaging
The admin messages tab SHALL include a messaging view that supports threaded conversations between admin and individual students. Messages SHALL be scoped by `student_id` and include a sender role (`student` or `admin`). Student messages and admin replies SHALL be created through authenticated server endpoints and the messaging view SHALL display a visible error when a send fails. The messages tab SHALL select a student's thread when opened with a valid `student` query parameter.

#### Scenario: Admin sends message to student
- **WHEN** an admin selects a student from the thread list, types a message, and sends
- **THEN** a message record is created with `sender = 'admin'` and `student_id` linking to the selected student
- **AND** the student sees the message in their dashboard

#### Scenario: Student sends message to admin
- **WHEN** an eligible student sends a message from their dashboard
- **THEN** a message record is created with `sender = 'student'` and appears in the admin messages tab under that student's thread

#### Scenario: Admin opens a deep-linked conversation
- **WHEN** an admin opens the Messages tab with a valid `student` query parameter
- **THEN** the matching student conversation is selected after the roster and messages load

#### Scenario: Admin message send fails
- **WHEN** an admin reply cannot be persisted
- **THEN** the messaging view displays an actionable error and retains the entered reply text

## REMOVED Requirements

### Requirement: Daily Ops operational UI pattern
**Reason**: The Student Messages section is removed from Daily Operations and moved to its own dedicated Messages tab. The remaining Daily Operations sections continue to use shared operational UI components.

**Migration**: The Message panel scenario references are removed. The remaining scenarios (Action Required and Student Roster) continue to use shared operational surfaces as before.
