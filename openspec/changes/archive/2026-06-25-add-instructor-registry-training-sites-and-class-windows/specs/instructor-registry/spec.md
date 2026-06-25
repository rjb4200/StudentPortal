## ADDED Requirements

### Requirement: Public instructor registration submission
The system SHALL provide a public instructor registration flow that collects instructor contact details, training site details, and at least one class with class start and ride-time end dates. Public submissions SHALL create pending records and SHALL NOT make instructors, sites, or classes visible to students until admin approval.

#### Scenario: Instructor submits registration
- **WHEN** a public user submits valid instructor, training site, and class information
- **THEN** the system creates pending instructor, training site, and training class records
- **AND** none of those records appear in student Site/Class options until approved

#### Scenario: Instructor registration requires class dates
- **WHEN** a public user submits instructor registration without `class_start_date` or `ride_time_end_date`
- **THEN** the system rejects the submission with a validation error
- **AND** no instructor, site, or class records are created

### Requirement: Instructor lifecycle management
The system SHALL allow admins to view, approve, reject, suspend, archive, edit, and manually create instructor records. Instructor records SHALL support statuses `pending`, `active`, `rejected`, `suspended`, and `archived`.

#### Scenario: Admin approves instructor
- **WHEN** an admin approves a pending instructor submission
- **THEN** the instructor status becomes `active`
- **AND** approval metadata records the approving admin and approval time

#### Scenario: Inactive instructor hidden from students
- **WHEN** an instructor has status `pending`, `rejected`, `suspended`, or `archived`
- **THEN** classes linked to that instructor do not appear in student Site/Class options

### Requirement: Public home instructor entry point
The public home page SHALL replace the existing Need Help contact tile with a clear instructor registration link that routes to the public instructor registration flow.

#### Scenario: Public user sees instructor registration link
- **WHEN** a user opens the public home page
- **THEN** the page displays a Register as Instructor style link
- **AND** activating the link navigates to the public instructor registration flow
