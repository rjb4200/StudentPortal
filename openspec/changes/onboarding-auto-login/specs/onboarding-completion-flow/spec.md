## MODIFIED Requirements

### Requirement: Admin-configurable completion screen
The system SHALL display an onboarding completion screen after the quiz that renders admin-configurable text from the database. For newly created accounts, the screen SHALL show a "Continue to Dashboard" button that performs client-side auto-login using the temporary password. For existing accounts, the screen SHALL only show instructions to use existing credentials and a login link. When no admin template is active, the screen SHALL display default content appropriate to the account type.

#### Scenario: Active completion message configured
- **WHEN** a student reaches the completion step and a completion template is active
- **THEN** the admin-configured title and body text are displayed
- **AND** for new accounts, a "Continue to Dashboard" button and credentials box are shown
- **AND** for existing accounts, a "Go to Login" link is shown

#### Scenario: New account with temp password and no template
- **WHEN** a new student reaches the completion step with a generated temp password and no completion template is active
- **THEN** a default completion message with the email and password is displayed
- **AND** a prominent "Continue to Dashboard" button performs client-side auto-login
- **AND** a secondary "Go to Login" link is available

#### Scenario: Existing account with no template
- **WHEN** a student with an existing auth account reaches the completion step and no completion template is active
- **THEN** a default message instructs them to use their existing WFD credentials
- **AND** no temporary credentials are displayed
- **AND** a "Go to Login" button links to `/login`

#### Scenario: Admin edits completion message
- **WHEN** an admin edits the completion message on the setup page
- **THEN** future students see the updated text on the completion screen regardless of account type
