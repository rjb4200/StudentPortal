## ADDED Requirements

### Requirement: Auth-failure message with onboarding link
The login page SHALL display a secondary "Don't have an account? Start Onboarding" link within the error message when authentication fails, providing new students a direct path to registration without requiring knowledge of the `/onboarding` URL.

#### Scenario: Auth failure shows onboarding link
- **WHEN** authentication fails with invalid credentials
- **THEN** the inline error message includes the text "Invalid email or password." followed by a "Don't have an account? Start Onboarding" link to `/onboarding`

## MODIFIED Requirements

### Requirement: Inline failure messages on student login
The login page SHALL display an inline contextual message when a post-authentication student-record query determines the student's status is not valid for dashboard access. The pre-authentication email lookup is removed; all status-based messages now fire after successful authentication. The message SHALL include the failure reason and, where a next step is applicable, an action button linking to the appropriate destination.

#### Scenario: No student record found
- **WHEN** a user authenticates successfully but no `students` row matches their `auth_user_id`
- **THEN** the login page displays an inline message: "Your login account exists but no student registration is linked. Please complete onboarding."
- **AND** the message includes an action button labeled "Start Onboarding" that links to `/onboarding`

#### Scenario: Blacklisted student
- **WHEN** a user authenticates and their only matching student record has `is_blacklisted = true`
- **THEN** the login page displays an inline error message: "This account has been removed from the WFD EMS Student Portal. If you believe this is an error, contact your class instructor or the WFD EMS Training Division."
- **AND** no action button is displayed

#### Scenario: Archived student
- **WHEN** a user authenticates and their matching student record has status `archived`
- **THEN** the login page displays an inline warning message: "Your previous registration has been archived. Please re-register to access the portal."
- **AND** the message includes an action button labeled "Re-register" that links to `/onboarding?status=archived`

#### Scenario: Expired student
- **WHEN** a user authenticates and their matching student record has status `expired`
- **THEN** the login page displays an inline warning message: "Your access has expired. Please re-register to continue."
- **AND** the message includes an action button labeled "Re-register" that links to `/onboarding`

