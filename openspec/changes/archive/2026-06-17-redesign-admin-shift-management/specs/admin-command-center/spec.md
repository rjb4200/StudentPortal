## REMOVED Requirements

### Requirement: Recent Activity feed
**Reason**: Low operational value — only shows 10 most recent evaluations plus manually appended events. Does not provide actionable information.
**Migration**: No migration needed. Data (evaluations table) remains intact. Evaluations are accessible via Preceptor Analytics tab.

### Requirement: Welcome Message inline preview
**Reason**: The welcome message is already fully editable on the Onboarding Setup page (`/admin/setup`). A read-only preview on the Daily Operations tab wastes space.
**Migration**: No migration needed. Full welcome message editor remains at `/admin/setup`. Students continue to see the welcome message on their dashboard.

## MODIFIED Requirements

### Requirement: Unified action required card with visual differentiation
The admin daily operations tab SHALL display actionable items within a unified "Action Required" card. The card SHALL contain four item types, each visually differentiated by badge color and button style: Approvals (sage green badge, crimson Approve button), Schedule Requests (blue badge, crimson Approve and red Reject buttons), Cancel Requests (amber/orange badge, amber Cancel Shift button), and Quiz Flags (amber badge, secondary Acknowledge button). Items SHALL be ordered: approvals first, then schedule requests, then cancel requests, then quiz flags. Each category SHALL be sorted newest first within itself.

#### Scenario: Visual differentiation of item types
- **WHEN** an admin views the Action Required card and multiple item types are present
- **THEN** each item type displays a distinct badge color and button style so the admin can immediately identify what kind of action is needed

#### Scenario: Cancel request appears in unified list
- **WHEN** a student cancels an approved shift
- **THEN** a Cancel Request item appears in the Action Required card with an amber badge labeled "Cancel Request", the student name, date, time, any student note, and an amber-colored "Cancel Shift" button

#### Scenario: Approved shifts not in action required
- **WHEN** an admin views the Action Required card
- **THEN** approved schedules do not appear — they are managed exclusively in the Shift Management section

#### Scenario: Empty unified list
- **WHEN** no pending approvals, schedule requests, cancel requests, or quiz flags exist
- **THEN** the Action Required card displays "Nothing requires your attention"
