# admin-student-profile

## Purpose

Dedicated student profile page at `/admin/students/[id]` with progressive-disclosure sections for instructor, TEI, class, ride history, and onboarding test status, plus a status summary card and data completeness warnings.

## ADDED Requirements

### Requirement: Dedicated student profile route

The system SHALL serve a student profile page at the route `/admin/students/[id]` accessible only to authenticated users with the admin role. The page SHALL display all available linked data for the student identified by the `[id]` route parameter.

#### Scenario: Admin navigates to student profile from roster

- **WHEN** an admin clicks a student name in the Student Roster
- **THEN** the browser navigates to `/admin/students/<student-id>` and displays the full student profile

#### Scenario: Non-admin cannot access student profile

- **WHEN** a non-admin user navigates to `/admin/students/<any-id>`
- **THEN** the system returns a 403 Forbidden response

#### Scenario: Invalid student ID

- **WHEN** an admin navigates to `/admin/students/<nonexistent-id>`
- **THEN** the system displays a "Student not found" message with a link back to the admin dashboard

### Requirement: Student status summary card

The profile page SHALL display a summary card at the top containing key student status information. The card SHALL include: student account status, class name, instructor name, TEI name, class start date, ride-time end date, onboarding test completion status, and legal document signing status.

#### Scenario: Summary card displays all available data

- **WHEN** an admin views a student profile for a certified student with class, instructor, and TEI assignments
- **THEN** the summary card shows status, class name, instructor, TEI, class start date, ride-time end date, onboarding test completed indicator, and legal documents signed indicator

#### Scenario: Summary card handles missing associations

- **WHEN** an admin views a student profile for a student with no class, instructor, or TEI assignment
- **THEN** the summary card displays "—" or "None" for those fields without error

#### Scenario: Status-driven color accent

- **WHEN** the summary card renders the student status
- **THEN** the status badge uses the existing color mapping: green for certified, gold for pending, gray for expired/archived, red for blacklisted

### Requirement: Expandable Instructor section

The profile SHALL include an expandable Instructor section that resolves the student's `instructor_id` foreign key to display the complete instructor record. When collapsed, the section header SHALL show the instructor name and status. When expanded, the section SHALL display all instructor fields including name, email, phone, status, and associated training site.

#### Scenario: Expand instructor section

- **WHEN** an admin clicks the collapsed Instructor section header
- **THEN** the section expands with a smooth animation and reveals the full instructor record

#### Scenario: Instructor section quick actions

- **WHEN** the Instructor section is expanded
- **THEN** action buttons are displayed: email instructor, copy email, copy phone number, and a link to the instructor profile

#### Scenario: Student has no assigned instructor

- **WHEN** a student has a null `instructor_id` but has denormalized `instructor_name` text
- **THEN** the section displays the denormalized text with a warning that the instructor is not linked to a registry record

#### Scenario: Student has no instructor information at all

- **WHEN** a student has null `instructor_id` and empty `instructor_name`
- **THEN** the section displays "No instructor assigned" and contributes to the data completeness warning

### Requirement: Expandable TEI section

The profile SHALL include an expandable TEI (Training Site) section that resolves the student's `training_site_id` foreign key to display the complete training site record. When collapsed, the section header SHALL show the site name and status.

#### Scenario: Expand TEI section

- **WHEN** an admin clicks the collapsed TEI section header
- **THEN** the section expands and reveals the full training site record including name, address, contact information, and status

#### Scenario: TEI section quick actions

- **WHEN** the TEI section is expanded
- **THEN** action buttons are displayed: email TEI contact, copy email, copy phone number

### Requirement: Expandable Class section

The profile SHALL include an expandable Class section that resolves the student's `training_class_id` foreign key to display the complete class record. When collapsed, the section header SHALL show the class name, start date, and ride-time end date. When expanded, the section SHALL display all class fields including the associated training site and instructor.

#### Scenario: Expand Class section

- **WHEN** an admin clicks the collapsed Class section header
- **THEN** the section expands and reveals the full class record including class name, start date, ride-time end date, status, associated site, and associated instructor

#### Scenario: Class section shows date ranges

- **WHEN** the Class section is expanded
- **THEN** the class start date and ride-time end date are displayed prominently with relative time indicators (e.g., "started 45 days ago", "ends in 30 days")

### Requirement: Ride history section

The profile SHALL include a Ride History section that queries the `schedules` table for the student and displays ride records with columns: date, shift type, time, status, and cancel reason (if applicable).

#### Scenario: Display student rides

- **WHEN** an admin views the Ride History section for a student with schedules
- **THEN** the section displays a table of all rides with status badges using the existing variant system

#### Scenario: Filter rides by status

- **WHEN** the Ride History section has multiple rides with different statuses
- **THEN** the admin can filter the view by status (All, Approved, Cancelled, Rejected, Pending)

#### Scenario: No rides found

- **WHEN** a student has no schedule records
- **THEN** the section displays "No ride history available"

### Requirement: Onboarding test status section

The profile SHALL include an Onboarding Test section that displays the student's quiz completion status and any quiz flags. The section SHALL show whether onboarding is completed and list any unacknowledged quiz flags.

#### Scenario: Onboarding completed

- **WHEN** a student has `onboarding_completed_at` set
- **THEN** the section displays "Completed" with the completion timestamp

#### Scenario: Onboarding not completed

- **WHEN** a student has null `onboarding_completed_at`
- **THEN** the section displays "Not completed" and contributes to the data completeness warning

#### Scenario: Quiz flags present

- **WHEN** a student has quiz flags
- **THEN** the section lists each flag with rule title, attempt count, and acknowledgment status

### Requirement: Data completeness warnings

The profile SHALL display warning banners when important related data is missing. Warnings SHALL be generated for: no TEI attached to the class, instructor phone number missing, student has no signed legal documents, onboarding test not completed, and no class association found.

#### Scenario: Multiple completeness warnings

- **WHEN** a student has multiple missing data conditions
- **THEN** a warning banner area at the top of the profile lists all missing items with amber styling

#### Scenario: All data is complete

- **WHEN** a student has all related data present and complete
- **THEN** no completeness warning banners are displayed

### Requirement: Progressive disclosure visual pattern

All expandable sections on the profile SHALL follow a consistent progressive-disclosure pattern: a clickable header row with a chevron indicator, the section title, and a collapsed summary (e.g., name + status for instructor). Expansion SHALL animate smoothly. The collapsed state SHALL show only the most critical information.

#### Scenario: Section collapse and expand

- **WHEN** an admin clicks an expanded section header
- **THEN** the section collapses with a smooth animation, hiding detail content and rotating the chevron indicator

#### Scenario: Multiple sections can be expanded simultaneously

- **WHEN** an admin expands the Instructor section and then expands the TEI section
- **THEN** both sections remain expanded independently

### Requirement: Student profile as operational UI source pattern
The admin student profile SHALL remain the visual baseline for shared operational UI components. Any component extraction or refactor involving the profile SHALL preserve its existing record-summary, fact-grid, disclosure, badge, alert, and compact-table behavior.

#### Scenario: Student profile is refactored to shared components
- **WHEN** shared operational components are introduced into the student profile
- **THEN** the page remains visually equivalent in structure and preserves existing route access, data display, warnings, disclosures, filters, actions, and print behavior

#### Scenario: Shared profile patterns are reused elsewhere
- **WHEN** another admin screen uses a shared fact grid, section card, alert, disclosure, or data table component
- **THEN** the rendered pattern remains recognizable as the same operational record style used by the student profile
