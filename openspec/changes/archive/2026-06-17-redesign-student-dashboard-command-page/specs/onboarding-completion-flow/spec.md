## MODIFIED Requirements

### Requirement: Pending student dashboard access
The system SHALL allow students with `status = 'pending'` who have an auth account linked by `students.auth_user_id` to access the dashboard. The dashboard SHALL display a status-first pending-review command state with clear next steps, approval expectations, and valid actions only.

#### Scenario: Pending dashboard after login
- **WHEN** a pending student logs in with email and password
- **THEN** the dashboard resolves the student row by `auth_user_id` and displays a pending-review status header
- **AND** the dashboard explains that scheduling, preceptor profiles, and evaluations unlock after administrator approval

#### Scenario: Pending dashboard valid actions
- **WHEN** a pending student views the dashboard
- **THEN** they see valid actions such as messaging training staff or copying their calendar feed
- **AND** they do not see schedule request, evaluation submission, or preceptor profile actions as available

#### Scenario: Dashboard upgrades after approval
- **WHEN** an admin approves a pending student
- **THEN** the student's dashboard upgrades to the full certified command page on next login or refresh
