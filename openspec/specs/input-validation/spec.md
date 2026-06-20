# input-validation Specification

## Purpose
TBD - created by archiving change add-input-validation. Update Purpose after archive.
## Requirements
### Requirement: Shared validation schemas

The system SHALL have a shared validation module (`src/lib/validation.ts`) using Zod that defines reusable schemas for common input types: email, UUID, name, phone, and bounded text. All API routes that accept user input SHALL validate `request.json()` bodies against these schemas before processing.

#### Scenario: Valid email passes validation

- **WHEN** a Zod email schema validates `"user@example.com"`
- **THEN** the value is accepted, trimmed, and lowercased

#### Scenario: Invalid email rejected

- **WHEN** a Zod email schema validates `"not-an-email"`
- **THEN** the validation fails with an error message
- **AND** the API route returns a 400 with the validation error

#### Scenario: Oversized text rejected

- **WHEN** a bounded text schema validates a string longer than the limit
- **THEN** the validation fails

### Requirement: Registration form input validation

The student registration form SHALL validate all built-in fields (full_name, email, phone, school_name, instructor_name, instructor_contact) using Zod schemas before calling the `register_onboarding_student` RPC. Email fields SHALL render as `type="email"` HTML inputs. Validation failures SHALL display an error message to the student and block the RPC call.

#### Scenario: Email field renders as type email

- **WHEN** a registration field is configured with `field_type='email'`
- **THEN** the HTML input renders with `type="email"`
- **AND** the browser provides email format validation

#### Scenario: Invalid email blocked before RPC

- **WHEN** a student submits the registration form with `email = "not-email"`
- **THEN** a validation error is displayed
- **AND** the `register_onboarding_student` RPC is not called

#### Scenario: Valid registration passes through

- **WHEN** a student submits valid registration data
- **THEN** all fields pass Zod validation
- **AND** the RPC is called with normalized (trimmed, lowercased email) values

### Requirement: API route body validation

Critical API routes that accept JSON bodies SHALL validate the request body against a Zod schema before processing. Invalid requests SHALL return HTTP 400 with a descriptive error message.

#### Scenario: Legal signature route validates body

- **WHEN** a POST to `/api/onboarding/legal-signature` sends `{ studentId: "not-a-uuid", fullName: "", agreedDocumentIds: [] }`
- **THEN** the route returns HTTP 400 with a validation error
- **AND** no data is written to the database

#### Scenario: Create auth user validates email and password

- **WHEN** a POST to `/api/admin/create-auth-user` sends `{ email: "bad", password: "12" }`
- **THEN** the route returns HTTP 400 with validation errors for both fields

### Requirement: Database field type and length constraints

The `registration_fields.field_type` column SHALL have a CHECK constraint restricting values to known types. The `students.phone` and `evaluations.comments` columns SHALL have length limits.

#### Scenario: Invalid field type rejected at database level

- **WHEN** an INSERT into `registration_fields` attempts `field_type = 'malicious'`
- **THEN** the database CHECK constraint rejects the row

#### Scenario: Oversized phone number rejected

- **WHEN** an UPDATE on `students` attempts to set `phone` to a string longer than 30 characters
- **THEN** the database CHECK constraint rejects the change

