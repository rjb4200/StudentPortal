## MODIFIED Requirements

### Requirement: Post-onboarding notification
Upon knowledge gate completion through a verified onboarding session, the system SHALL send an email to the Training Major containing the new student's name, school, and instructor details, requesting account approval. The completion page SHALL differentiate between newly created and existing accounts, providing auto-login only for new accounts. The PIN email and PIN display SHALL remain available for newly created accounts after onboarding session proof is verified.

#### Scenario: New account onboarding complete
- **WHEN** a student with a newly created auth account completes the knowledge gate with matching onboarding session proof
- **THEN** the completion page displays the student's temporary credentials and a "Continue to Dashboard" button for client-side auto-login
- **AND** the student receives an email containing the PIN/password
- **AND** the Training Major receives an email with student details

#### Scenario: Existing account onboarding complete
- **WHEN** a student with a linked existing auth account completes the knowledge gate with matching onboarding session proof
- **THEN** the completion page displays instructions to use existing credentials and a "/login" link
- **AND** no auto-login button or temporary credentials are shown
- **AND** the Training Major receives an email with student details

#### Scenario: Completion rejected without matching session proof
- **WHEN** a caller attempts to finish onboarding for a student id without matching onboarding session proof
- **THEN** no PIN/password is generated, no completion notification is sent, and the student sees a clear session verification error
