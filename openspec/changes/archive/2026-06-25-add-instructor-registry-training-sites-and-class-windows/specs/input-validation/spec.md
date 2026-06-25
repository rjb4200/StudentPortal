## MODIFIED Requirements

### Requirement: Registration form input validation

The student registration form SHALL validate built-in student identity fields and the required Site/Class selection using shared Zod schemas before calling the onboarding registration API. Email fields SHALL render as `type="email"` HTML inputs. Validation failures SHALL display an error message to the student and block the registration API call. Legacy school and instructor text fields SHALL not be required for new class-linked registrations.

#### Scenario: Email field renders as type email

- **WHEN** a registration field is configured with `field_type='email'`
- **THEN** the HTML input renders with `type="email"`
- **AND** the browser provides email format validation

#### Scenario: Invalid email blocked before API call

- **WHEN** a student submits the registration form with `email = "not-email"`
- **THEN** a validation error is displayed
- **AND** the onboarding registration API is not called

#### Scenario: Missing Site/Class blocked before API call

- **WHEN** a student submits the registration form without selecting a Site/Class option
- **THEN** a validation error is displayed
- **AND** the onboarding registration API is not called

#### Scenario: Valid registration passes through

- **WHEN** a student submits valid registration data with a visible approved Site/Class selection
- **THEN** all fields pass Zod validation
- **AND** the registration API is called with normalized values and the selected class id

## ADDED Requirements

### Requirement: Instructor and class validation schemas
The system SHALL validate public instructor registration, training site data, and training class data with shared schemas before writing records. Date validation SHALL require `ride_time_end_date` on or after `class_start_date`.

#### Scenario: Invalid instructor email rejected
- **WHEN** instructor registration is submitted with an invalid email address
- **THEN** the API returns HTTP 400 with a validation error
- **AND** no pending registry records are created

#### Scenario: Invalid class date range rejected
- **WHEN** instructor registration is submitted with `ride_time_end_date` before `class_start_date`
- **THEN** the API returns HTTP 400 with a validation error
- **AND** no invalid class record is created

### Requirement: Schedule window validation
The system SHALL validate schedule creation requests against the student's selected class date window before creating schedule records.

#### Scenario: Out-of-window schedule rejected
- **WHEN** a class-linked student submits a schedule request before `class_start_date` or after `ride_time_end_date`
- **THEN** the system rejects the request with a validation error
- **AND** no schedule row is created
