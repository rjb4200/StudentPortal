## ADDED Requirements

### Requirement: Admin SMS contact preferences
The system SHALL allow admin users to manage SMS contact details and SMS alert preferences for admin accounts alongside existing email notification preferences.

#### Scenario: Edit admin SMS phone and opt-in
- **WHEN** an admin edits an admin account's phone number, SMS opt-in, and SMS verified fields
- **THEN** the changes are saved to the admin account and future admin SMS alerts respect those values

#### Scenario: Edit admin SMS alert categories
- **WHEN** an admin edits another admin's SMS alert category toggles
- **THEN** future admin SMS alerts are sent only for enabled categories when global admin SMS alerts are enabled

#### Scenario: Admin not opted in to SMS alerts
- **WHEN** an operational event occurs for an admin account without SMS opt-in
- **THEN** the system does not enqueue an SMS alert for that admin account

### Requirement: Student SMS consent management
The system SHALL allow admin users to view and update student SMS consent fields from account management without modifying student identity or auth linkage.

#### Scenario: Edit student SMS consent
- **WHEN** an admin updates a student's phone number, SMS opt-in, or SMS verified status
- **THEN** the student record is updated and subsequent student SMS queueing uses the new values

#### Scenario: Disable student SMS
- **WHEN** an admin disables SMS opt-in for a student
- **THEN** future student SMS notifications are not enqueued for that student
