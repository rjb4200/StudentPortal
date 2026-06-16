## MODIFIED Requirements

### Requirement: Student account editing
The system SHALL allow admin users to edit student personal information (name, email, phone, school, instructor, contact), status, blacklist flag, test-record flag, auth linkage, previous-student linkage, and no-show count from the Account Management page. Admin edits SHALL NOT change `students.id`.

#### Scenario: Edit student info
- **WHEN** an admin changes a student's name, email, or school information and saves
- **THEN** the student record is updated and changes reflect on the roster and dashboard

#### Scenario: Change student status
- **WHEN** an admin changes a student's status from pending to certified
- **THEN** the student's dashboard access is updated on next middleware check

#### Scenario: Archive student
- **WHEN** an admin changes a student's status to `archived`
- **THEN** the student can no longer access `/dashboard` and the historical row remains available to admins

#### Scenario: Manage test-record flag
- **WHEN** an admin marks or unmarks a student as a test record
- **THEN** the `is_test_record` value is updated without modifying the student's primary key or historical fields

#### Scenario: Student roster links to edit page
- **WHEN** an admin clicks a student name in the Daily Ops Student Roster
- **THEN** the browser navigates to `/admin/accounts?edit=<student-id>` with the student's edit form open

## ADDED Requirements

### Requirement: Admin-only test student reset
The system SHALL provide an explicit admin-only reset workflow for student records marked `is_test_record = true`. The reset workflow MUST NOT affect non-test student records.

#### Scenario: Reset test student by email
- **WHEN** an admin requests a test reset for an email that only matches records with `is_test_record = true`
- **THEN** the system clears or removes test-generated approval state, onboarding progress, schedules, messages, and related test-only records as appropriate

#### Scenario: Reset unlinks test auth user
- **WHEN** a test reset targets a test student with an associated `auth_user_id`
- **THEN** the system unlinks the auth user from the test student row and may delete the associated auth user when it is safe to do so

#### Scenario: Non-test reset blocked
- **WHEN** an admin requests a test reset for an email that matches any record with `is_test_record = false`
- **THEN** the test reset is rejected and no non-test student record or related historical data is modified

#### Scenario: Unauthenticated reset blocked
- **WHEN** a non-admin or unauthenticated user attempts to reset a test student
- **THEN** the request is rejected and no data is modified
