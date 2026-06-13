## ADDED Requirements

### Requirement: Admin can delete student records
The system SHALL allow admin users to permanently delete student records from the Student Roster with a 2-stage confirmation process.

#### Scenario: Admin deletes a student
- **WHEN** an admin clicks Delete on a student row and confirms both warning dialogs
- **THEN** the student record and all associated data (schedules, evaluations, messages, notes) are permanently deleted from the database

#### Scenario: Admin cancels delete
- **WHEN** an admin clicks Delete but cancels at either confirmation stage
- **THEN** no data is deleted and the roster remains unchanged

#### Scenario: Delete fails
- **WHEN** the delete operation encounters a database error
- **THEN** an error message is displayed and no data is removed

### Requirement: Notes column removed from Student Roster
The Student Roster SHALL no longer display an inline Notes column. The `admin_notes` table SHALL remain in the database for potential future use.

#### Scenario: Admin views Student Roster
- **WHEN** an admin views the Student Roster table
- **THEN** the table displays Student, Status, No-Shows, and Actions columns without a Notes column
