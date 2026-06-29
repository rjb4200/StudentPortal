# admin-student-notes

## Purpose

Internal admin-only notes section on the student profile page, using the existing `admin_notes` table for persistent storage with admin-exclusive visibility.

## ADDED Requirements

### Requirement: Admin notes display on student profile

The student profile SHALL include an Admin Notes section that displays all notes for the student from the `admin_notes` table. Each note SHALL display its text content, priority level, and creation timestamp. Notes SHALL be ordered newest-first.

#### Scenario: Display existing notes

- **WHEN** an admin views a student profile that has existing admin notes
- **THEN** the Admin Notes section lists all notes in reverse chronological order with priority badges

#### Scenario: No notes exist

- **WHEN** a student has no `admin_notes` records
- **THEN** the section displays "No admin notes" with an "Add Note" button visible

#### Scenario: Priority badge coloring

- **WHEN** a note has priority "high_accessibility"
- **THEN** the note displays an orange priority badge; notes with "normal" priority display a blue badge (matching the existing convention from admin-command-center spec)

### Requirement: Create admin note

Admins SHALL be able to add a new note to a student from the profile page. The note form SHALL include a text input for note content and a priority selector (normal or high_accessibility).

#### Scenario: Add a new admin note

- **WHEN** an admin types a note, selects a priority, and clicks "Add Note"
- **THEN** a new row is inserted into `admin_notes` with the student ID, note text, priority, and current timestamp, and the notes list refreshes to show the new note

#### Scenario: Empty note submission prevented

- **WHEN** an admin attempts to submit a note with empty text
- **THEN** the form prevents submission and shows a validation message

### Requirement: Delete admin note

Admins SHALL be able to delete an individual note from the student profile. Deletion SHALL require confirmation.

#### Scenario: Delete a note

- **WHEN** an admin clicks delete on a note and confirms the action
- **THEN** the `admin_notes` row is removed from the database and the notes list refreshes

### Requirement: Admin-only visibility

Admin notes SHALL be visible only to authenticated admin users. Notes SHALL NOT be visible to students, instructors, preceptors, or unauthenticated users.

#### Scenario: Student cannot see admin notes

- **WHEN** a student (or any non-admin user) accesses any surface that could display admin notes
- **THEN** the admin notes data is not included in the response and not rendered in the UI

#### Scenario: Admin notes survive student-level operations

- **WHEN** a student's status changes (approval, expiration, archival) or the student is blacklisted
- **THEN** their admin notes remain intact and continue to be visible to admins
