## ADDED Requirements

### Requirement: Daily Ops operational UI pattern
The Daily Operations admin section SHALL use shared operational UI components for action queues, message panels, roster tables, alerts, empty states, and loading states where those components match existing behavior.

#### Scenario: Action Required uses shared operational surfaces
- **WHEN** an admin views the Action Required area
- **THEN** the area uses shared section, alert, badge, and empty-state patterns while preserving the existing action ordering and approval behavior

#### Scenario: Student roster uses shared data table styling
- **WHEN** an admin views the Student Roster
- **THEN** the roster uses the shared compact admin table pattern with consistent headers, row spacing, badges, and action placement

#### Scenario: Message panel uses shared section styling
- **WHEN** an admin views Student Messages
- **THEN** the message list and conversation panel are presented within the shared operational section/card pattern without changing message threading behavior

## MODIFIED Requirements

### Requirement: Kill switch for student access
A prominent red toggle SHALL allow the admin to terminate a student's access. Activation SHALL prompt a reusable confirmation dialog. A reverse switch SHALL be available for instant reactivation.

#### Scenario: Terminate student access
- **WHEN** an admin toggles the kill switch on a student and confirms the action
- **THEN** the student's access is immediately revoked and the student is redirected to `/onboarding` on their next request

#### Scenario: Reactivate student access
- **WHEN** an admin toggles the reactivation switch on a previously terminated student
- **THEN** the student's access is immediately restored and they can log in again
