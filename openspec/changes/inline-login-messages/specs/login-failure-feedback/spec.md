## ADDED Requirements

### Requirement: Inline failure messages on student login
The login page SHALL display an inline contextual message instead of redirecting the user when a pre-login student-lookup determines the student record is not in a valid state for authentication. The message SHALL include the failure reason and, where a next step is applicable, an action button linking to the appropriate destination.

#### Scenario: No student record found
- **WHEN** a user enters an email on the Student tab that has no matching row in the `students` table
- **THEN** the login page displays an inline warning message: "No student registration was found for this email. Please complete onboarding before signing in."
- **AND** the message includes an action button labeled "Start Onboarding" that links to `/onboarding`

#### Scenario: Blacklisted student
- **WHEN** a user enters an email on the Student tab that matches a student with `is_blacklisted = true`
- **THEN** the login page displays an inline error message: "This account has been removed from the WFD EMS Student Portal. If you believe this is an error, contact your class instructor or the WFD EMS Training Division."
- **AND** no action button is displayed

#### Scenario: Archived student
- **WHEN** a user enters an email on the Student tab whose only records have status `archived`
- **THEN** the login page displays an inline warning message: "Your previous registration has been archived. Please re-register to access the portal."
- **AND** the message includes an action button labeled "Re-register" that links to `/onboarding?status=archived`

#### Scenario: Expired student
- **WHEN** a user enters an email on the Student tab whose only records have status `expired`
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
