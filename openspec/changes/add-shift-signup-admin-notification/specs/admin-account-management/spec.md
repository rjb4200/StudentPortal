## MODIFIED Requirements

### Requirement: Notification recipient configuration
The system SHALL use per-account notification preferences from `admin_accounts` and `preceptors` to determine email recipients for system notifications, replacing hard-coded email addresses. Active admin accounts SHALL support an independently configurable student-message email notification preference. Active admin accounts SHALL support an independently configurable shift request email notification preference via the `notify_schedule_requested` toggle.

#### Scenario: Onboarding complete notification
- **WHEN** a student completes onboarding
- **THEN** emails are sent to all active admin accounts with `notify_onboarding_complete = true`

#### Scenario: Flagged evaluation notification
- **WHEN** an evaluation is submitted with overall rating less than 3
- **THEN** emails are sent to all active admin accounts with `notify_evaluation_flagged = true`

#### Scenario: Student-message notification preference
- **WHEN** an admin enables or disables student-message email notifications and saves the account
- **THEN** future student-message alerts include or exclude that active admin according to the saved preference

#### Scenario: Shift request notification preference
- **WHEN** an admin enables or disables shift request email notifications and saves the account
- **THEN** future student shift request notifications include or exclude that active admin according to the `notify_schedule_requested` preference
