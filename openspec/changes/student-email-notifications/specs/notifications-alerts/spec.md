## MODIFIED Requirements

### Requirement: Post-onboarding notification
Upon knowledge gate completion, the system SHALL send an email to the Training Major containing the new student's name, school, and instructor details, requesting account approval. The completion page SHALL differentiate between newly created and existing accounts, providing auto-login only for new accounts. The onboarding credential email SHALL use crimson `#A40104` for header background, CTA button, and all branded color elements (not `#B61C20`).

#### Scenario: New account onboarding complete
- **WHEN** a student with a newly created auth account completes the knowledge gate
- **THEN** the completion page displays the student's temporary credentials and a "Continue to Dashboard" button for client-side auto-login
- **AND** the Training Major receives an email with student details
- **AND** the credential email uses crimson `#A40104` throughout

#### Scenario: Existing account onboarding complete
- **WHEN** a student with a linked existing auth account completes the knowledge gate
- **THEN** the completion page displays instructions to use existing credentials and a "/login" link
- **AND** no auto-login button or temporary credentials are shown
- **AND** the Training Major receives an email with student details
