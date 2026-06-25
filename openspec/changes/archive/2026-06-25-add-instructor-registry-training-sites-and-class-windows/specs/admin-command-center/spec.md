## MODIFIED Requirements

### Requirement: Unified action required card with visual differentiation
The admin daily operations tab SHALL display actionable items within a unified "Action Required" card. The card SHALL contain student approvals, instructor/site/class submissions, schedule requests, cancel requests, and quiz flags, each visually differentiated by badge color and button style. Student Approval items are for students with `status = 'pending'` and non-null `onboarding_completed_at`. Instructor, site, and class review items are for records with status `pending`. Schedule Requests, Cancel Requests, and Quiz Flags SHALL retain their existing behavior. Items SHALL be ordered: student approvals first, instructor/site/class submissions next, then schedule requests, then cancel requests, then quiz flags. Each category SHALL be sorted newest first within itself. Approval failures SHALL be displayed to the admin and SHALL NOT be represented as successful approvals unless the relevant API confirms success.

#### Scenario: Approve a new class-linked student
- **WHEN** the Training Major clicks "Approve" on a pending student with `training_class_id` and the approval API confirms success
- **THEN** the system sets `status` to `certified`, sets `access_until` from the selected class `ride_time_end_date`, sends a welcome email to the student, and refreshes the Action Required list

#### Scenario: Approve a legacy unassigned student
- **WHEN** the Training Major clicks "Approve" on a pending student without `training_class_id` and the approval API confirms success
- **THEN** the system applies the existing legacy access expiration behavior, sends a welcome email to the student, and refreshes the Action Required list

#### Scenario: Incomplete pending student does not appear for approval
- **WHEN** a student has `status = 'pending'` and `onboarding_completed_at IS NULL`
- **THEN** the student does not appear as an Approval item in Action Required

#### Scenario: Approval-ready pending student appears for approval
- **WHEN** a student has `status = 'pending'` and `onboarding_completed_at IS NOT NULL`
- **THEN** the student appears as an Approval item in Action Required

#### Scenario: Pending instructor submission appears for review
- **WHEN** an instructor registration has status `pending`
- **THEN** the instructor submission appears in Action Required with admin review actions

#### Scenario: Pending training site submission appears for review
- **WHEN** a training site has status `pending`
- **THEN** the training site submission appears in Action Required with admin review actions

#### Scenario: Pending training class submission appears for review
- **WHEN** a training class has status `pending`
- **THEN** the training class submission appears in Action Required with admin review actions

#### Scenario: Approval failure is visible
- **WHEN** the Training Major clicks "Approve" on a pending item and the approval API fails
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
- **WHEN** no approval-ready students, pending instructor/site/class submissions, schedule requests, cancel requests, or quiz flags exist
- **THEN** the Action Required card displays "Nothing requires your attention"

### Requirement: Student roster expiration countdown badge
The admin daily operations Student Roster SHALL display certified students only and SHALL exclude incomplete pending registrations and approval-ready pending students. The roster SHALL display a color-coded, number-only expiration countdown badge for each certified student with an `access_until` value. For class-linked students, hover text SHALL identify the class name and ride-time end date when available.

#### Scenario: Certified student has remaining access days
- **WHEN** an admin views the Student Roster and a certified student has future `access_until` value
- **THEN** the roster displays a zero-padded three-digit countdown badge such as `120`, `115`, or `001`

#### Scenario: Countdown badge communicates urgency
- **WHEN** an admin views countdown badges in the Student Roster
- **THEN** each countdown badge is colored according to remaining-day urgency

#### Scenario: Countdown badge has hover text
- **WHEN** an admin hovers over a countdown badge for a class-linked student
- **THEN** the system displays hover text explaining the student's days remaining, selected class, and ride-time end date

#### Scenario: Missing access expiration date
- **WHEN** an admin views a certified student without an `access_until` value
- **THEN** the roster does not display an expiration countdown badge for that student or displays a clear admin-only warning state

#### Scenario: Pending student excluded from roster
- **WHEN** an admin views the Student Roster and a student has `status = 'pending'`
- **THEN** that student does not appear in the Student Roster regardless of `onboarding_completed_at`

## ADDED Requirements

### Requirement: Instructor site and class management
The admin command center SHALL provide a management surface where admins can view, edit, manually create, approve, reject, suspend, and archive instructors, training sites, and training classes.

#### Scenario: Admin edits class date window
- **WHEN** an admin edits an active class start or ride-time end date
- **THEN** future student-facing class visibility and scheduling enforcement use the updated date window

#### Scenario: Admin sees students assigned to class
- **WHEN** an admin views a training class record
- **THEN** the system shows students assigned to that class
