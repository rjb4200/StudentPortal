# login-failure-feedback Specification

## Purpose
TBD - created by archiving change inline-login-messages. Update Purpose after archive.
## Requirements
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

### Requirement: Reason query parameter on login page
The login page SHALL read a `reason` query parameter from the URL on mount and display the corresponding inline failure message without requiring the user to re-enter their email.

#### Scenario: Redirect from middleware with reason
- **WHEN** an authenticated user is redirected to `/login?reason=expired` by the middleware
- **THEN** the login page immediately displays the expired-access message with the re-register action button

#### Scenario: Redirect from auth callback with reason
- **WHEN** an authenticated user is redirected to `/login?reason=blacklisted` by the auth callback route
- **THEN** the login page immediately displays the blacklisted-account message

#### Scenario: No reason parameter
- **WHEN** a user navigates to `/login` without a `reason` query parameter
- **THEN** the login page renders the normal login form without a pre-displayed message

### Requirement: Inline message styling and actions
The login page message SHALL support three visual types: `error` (crimson), `warning` (gold), and `success` (sage). Messages with action SHALL render a clickable action button below the message text.

#### Scenario: Warning message with action
- **WHEN** an expired-access message is displayed
- **THEN** the message uses gold-based styling and renders a "Re-register" button that navigates to `/onboarding`

#### Scenario: Error message without action
- **WHEN** a blacklisted-account message is displayed
- **THEN** the message uses crimson-based styling without an action button

#### Scenario: Action button click
- **WHEN** a user clicks the "Start Onboarding" action button on a no-record message
- **THEN** the browser navigates to `/onboarding`

### Requirement: Auth-failure message with onboarding link
The login page SHALL display a secondary "Don't have an account? Start Onboarding" link within the error message when authentication fails, providing new students a direct path to registration without requiring knowledge of the `/onboarding` URL.

#### Scenario: Auth failure shows onboarding link
- **WHEN** authentication fails with invalid credentials
- **THEN** the inline error message includes the text "Invalid email or password." followed by a "Don't have an account? Start Onboarding" link to `/onboarding`

