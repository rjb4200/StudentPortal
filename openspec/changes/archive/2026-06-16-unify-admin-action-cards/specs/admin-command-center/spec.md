## MODIFIED Requirements

### Requirement: New student approval queue
The admin daily operations tab SHALL display pending student approvals within a unified "Action Required" card alongside schedule requests and quiz flags. Each entry SHALL show a type badge ("Approval"), the student's name, school, instructor, and an Approve button. Approvals SHALL appear first in the list, sorted newest first.

#### Scenario: Approve a new student
- **WHEN** the Training Major clicks "Approve" on a pending student in the unified Action Required list
- **THEN** the system sets `status` to `certified`, sets `access_until` to 120 days from now, and sends a welcome email to the student

#### Scenario: Approval appears first in unified list
- **WHEN** both pending approvals and schedule requests exist
- **THEN** approval items appear before schedule request items
- **AND** each item displays a type badge identifying it as Approval, Schedule, or Flag

### Requirement: Schedule request management
The admin daily operations tab SHALL display pending schedule requests within the unified "Action Required" card. Each entry SHALL show a type badge ("Schedule"), the student's name, date, shift type, and Approve/Reject buttons. Schedule requests SHALL appear after approvals and before quiz flags.

#### Scenario: Approve a schedule request
- **WHEN** an admin clicks "Approve" on a schedule request in the unified list
- **THEN** the schedule status changes to `approved`

#### Scenario: Reject a schedule request
- **WHEN** an admin clicks "Reject" on a schedule request in the unified list
- **THEN** the schedule status changes to `rejected`

## ADDED Requirements

### Requirement: Quiz flag acknowledgment
The admin daily operations tab SHALL display unacknowledged quiz flags within the unified "Action Required" card. Each entry SHALL show a type badge ("Flag"), the student's name, rule title, attempt count, date, and an Acknowledge button. Quiz flags SHALL appear after schedule requests.

#### Scenario: Acknowledge a quiz flag
- **WHEN** an admin clicks "Acknowledge" on a quiz flag in the unified list
- **THEN** the flag is marked as acknowledged and removed from the active list

#### Scenario: Empty unified list
- **WHEN** no pending approvals, schedule requests, or quiz flags exist
- **THEN** the Action Required card displays "Nothing requires your attention"
