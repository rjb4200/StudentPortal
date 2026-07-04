## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Admin MOU notification preference
The `admin_accounts` table SHALL support a notification preference for class MOU completion emails so that only admins who opt in receive completed MOU PDF attachments.

#### Scenario: Admin enables MOU notifications
- **WHEN** an admin enables the MOU notification preference on their account
- **THEN** they receive completed MOU PDF emails when both parties have signed

#### Scenario: Admin disables MOU notifications
- **WHEN** an admin disables the MOU notification preference
- **THEN** they do not receive completed MOU PDF emails
