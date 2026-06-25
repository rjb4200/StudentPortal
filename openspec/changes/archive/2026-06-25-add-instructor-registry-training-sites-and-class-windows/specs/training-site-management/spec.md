## ADDED Requirements

### Requirement: Training site records
The system SHALL store training sites as admin-reviewed records with site name, organization or school name, address, city, state, ZIP code, optional main phone, status, approval metadata, and timestamps.

#### Scenario: Training site submitted for review
- **WHEN** a public instructor registration includes a new training site
- **THEN** the system creates a training site record with status `pending`
- **AND** the site is unavailable for student selection until approved

### Requirement: Training site lifecycle management
The system SHALL allow admins to view, approve, reject, suspend, archive, edit, and manually create training site records. Training site records SHALL support statuses `pending`, `active`, `rejected`, `suspended`, and `archived`.

#### Scenario: Admin approves training site
- **WHEN** an admin approves a pending training site
- **THEN** the site status becomes `active`
- **AND** active approved classes linked to the site may become visible to students if all class visibility requirements are met

#### Scenario: Suspended site hides linked classes
- **WHEN** a training site is suspended or archived
- **THEN** classes linked to that site do not appear in student Site/Class options

### Requirement: Training site reuse
The system SHALL support associating multiple instructors and classes with the same active training site without duplicating the site record.

#### Scenario: Admin creates class for existing site
- **WHEN** an admin creates a class and selects an existing active training site
- **THEN** the class references that site by `training_site_id`
- **AND** no duplicate training site is required
