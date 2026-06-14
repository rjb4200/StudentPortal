## MODIFIED Requirements

### Requirement: Student registration form
The system SHALL present a multi-step registration form collecting full name, email, phone, school name, instructor name, and instructor contact. The email field SHALL be validated for uniqueness against the students table. The onboarding route SHALL be anonymously accessible at `/onboarding` without requiring a query token.

#### Scenario: Successful registration
- **WHEN** a student submits a complete registration form with a unique email from `/onboarding`
- **THEN** the student record is created with status `pending` and the workflow advances to the legal waiver step

#### Scenario: Duplicate email registration
- **WHEN** a student submits a registration form with an email already present in the students table
- **THEN** the system displays an error message and blocks submission

#### Scenario: Missing required fields
- **WHEN** a student submits the form with any required field empty
- **THEN** the system highlights the missing fields and blocks submission

#### Scenario: Direct onboarding access
- **WHEN** a user navigates directly to `/onboarding` without a token query parameter
- **THEN** the system displays the onboarding registration flow
