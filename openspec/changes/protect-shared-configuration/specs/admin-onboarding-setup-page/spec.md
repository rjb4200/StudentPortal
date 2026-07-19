## ADDED Requirements

### Requirement: Protected onboarding setup settings
The onboarding setup page SHALL present persisted welcome-message, completion-message, and help-email settings as read-only until an administrator explicitly starts editing each setting.

#### Scenario: Administrator opens onboarding setup
- **WHEN** an administrator views an existing onboarding setup setting
- **THEN** its stored value is displayed without an editable input

#### Scenario: Administrator saves an onboarding setup setting
- **WHEN** an administrator explicitly edits and saves a valid onboarding setup setting
- **THEN** the new setting is persisted and used by future student-facing views

#### Scenario: Administrator cancels an onboarding setup edit
- **WHEN** an administrator cancels an onboarding setup edit
- **THEN** the prior stored setting remains displayed and unchanged
