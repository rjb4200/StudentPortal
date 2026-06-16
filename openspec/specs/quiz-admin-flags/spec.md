# quiz-admin-flags Specification

## Purpose
TBD - created by archiving change polish-knowledge-review-quiz. Update Purpose after archive.
## Requirements
### Requirement: Admin flag on high-attempt rule pass
The system SHALL notify administrators when a student passes a quiz rule after 3 or more failed attempts, and SHALL allow administrators to acknowledge the flag from the dashboard.

#### Scenario: Flag created on pass after struggles
- **WHEN** a student correctly submits an answer for a rule
- **AND** the student had 3 or more prior failed attempts on that same rule
- **THEN** the system creates or updates a quiz flag record with the student ID, rule ID, rule title, student name, student email, and total attempt count
- **AND** the flag appears in the admin dashboard

#### Scenario: No flag for clean pass
- **WHEN** a student correctly submits an answer for a rule with fewer than 3 prior failed attempts
- **THEN** no quiz flag is created

#### Scenario: Flag deduplication
- **WHEN** a student who already has an existing flag for a rule passes that rule again in a later session
- **THEN** the existing flag is updated with the new attempt count and reset to unacknowledged

### Requirement: Admin dashboard quiz flags card
The system SHALL display a quiz flags card in the Daily Operations tab of the Admin Command Center showing students who struggled on quiz rules.

#### Scenario: Flags list display
- **WHEN** an admin views the Daily Operations tab
- **THEN** a quiz flags card is displayed listing all unacknowledged flags
- **AND** each flag shows the student name, rule title, attempt count, and creation date

#### Scenario: Empty flags state
- **WHEN** no unacknowledged quiz flags exist
- **THEN** the quiz flags card shows "No quiz flags" with a muted text style

#### Scenario: Admin acknowledges a flag
- **WHEN** an admin clicks "Acknowledge" on a quiz flag
- **THEN** the flag is marked as acknowledged with the admin's ID and current timestamp
- **AND** the flag is removed from the active flags list

### Requirement: Quiz flag API
The system SHALL provide API endpoints for creating and acknowledging quiz flags.

#### Scenario: Student client creates flag
- **WHEN** the student client sends a POST request to `/api/quiz/flag` with a valid `studentId` and `ruleId`
- **THEN** the server looks up the rule title, student name, and student email from the database
- **AND** upserts a record into the `quiz_flags` table

#### Scenario: Admin acknowledges flag
- **WHEN** an authenticated admin sends a POST request to `/api/admin/acknowledge-quiz-flag` with a valid `flagId`
- **THEN** the server marks the flag as acknowledged with the admin's user ID and the current timestamp
- **AND** returns a 200 success response

#### Scenario: Non-admin flag access denied
- **WHEN** a non-admin user attempts to call the acknowledge-quiz-flag endpoint
- **THEN** the server returns a 403 error

### Requirement: Quiz flags database table
The system SHALL maintain a `quiz_flags` table to store quiz struggle flags.

#### Scenario: Flag record structure
- **WHEN** a quiz flag record is created
- **THEN** it contains a unique ID, student ID (foreign key to students), rule ID (foreign key to quiz_rules), denormalized rule title, student name, student email, attempt count, acknowledged status, acknowledged by admin ID, acknowledged timestamp, and creation timestamp

#### Scenario: Unique flag per student-rule pair
- **WHEN** an attempt is made to insert a duplicate flag for the same student and rule
- **THEN** the existing record is updated instead of creating a duplicate

