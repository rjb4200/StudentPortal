# shift-cancellation Specification

## Purpose
TBD - created by archiving change shift-cancellation. Update Purpose after archive.
## Requirements
### Requirement: Student cancels own shift
A student SHALL be able to cancel a pending or approved shift by clicking the shift's date on the calendar grid. Clicking a date with an existing shift SHALL open a cancel confirmation modal showing the date, time range, and current status. Cancelling a pending shift SHALL take effect immediately with no additional input required. Cancelling an approved shift SHALL require the student to enter a reason in a required note field before the cancellation is submitted. The system SHALL send a WFD-branded cancellation confirmation email to the student and notify active admins via email, including the note when present.

#### Scenario: Student cancels a pending shift
- **WHEN** a student clicks a calendar date with a pending shift and confirms cancellation in the modal
- **THEN** the schedule status is immediately set to `'cancelled'`, the calendar cell updates to cancelled styling, and the student receives a cancellation confirmation email

#### Scenario: Student cancels an approved shift with required note
- **WHEN** a student clicks a calendar date with an approved shift, enters a reason in the required note field, and confirms cancellation
- **THEN** the schedule status is immediately set to `'cancelled'`, `cancel_note` is stored with the student's reason, and the student receives a cancellation confirmation email that includes their note

#### Scenario: Student blocked from cancelling approved shift without note
- **WHEN** a student clicks a calendar date with an approved shift and attempts to confirm cancellation without entering a note
- **THEN** the cancel button is disabled or the submission is blocked with a message that a reason is required

#### Scenario: Admin notified of student cancellation
- **WHEN** a student cancels their own shift (pending or approved)
- **THEN** all active admins receive an email notification with the student's name, date, time, the word "Student-initiated", and the student's note when present

### Requirement: Admin cancels any shift with optional note
An admin SHALL be able to cancel any non-cancelled, non-rejected shift from the daily-ops panel. Before confirming, the admin MAY enter an optional note in a text input. The system SHALL store the note in `cancel_note` and send a WFD-branded cancellation email to the student that includes the note when present. The note input SHALL display a hint that the student will see the note.

#### Scenario: Admin cancels a shift with a note
- **WHEN** an admin clicks "Cancel" on a pending or approved shift, enters a note "Class cancelled due to weather", and confirms
- **THEN** the schedule status is set to `'cancelled'`, `cancel_note` is stored, and the student receives an email with the note included

#### Scenario: Admin cancels a shift without a note
- **WHEN** an admin clicks "Cancel" on a pending or approved shift without entering a note and confirms
- **THEN** the schedule status is set to `'cancelled'`, `cancel_note` is null, and the student receives an email without a note section

#### Scenario: Note hint visible to admin
- **WHEN** an admin opens the cancel note input
- **THEN** a hint is displayed: "This note will be included in the cancellation email to the student"

### Requirement: Cancelled calendar cell styling
Cancelled shift calendar cells SHALL display distinct orange styling, visually different from rejected cells (gray with strikethrough). This allows students to distinguish between "I cancelled this" and "the admin rejected this."

#### Scenario: Cancelled cell is orange
- **WHEN** a student views the calendar grid with a cancelled shift
- **THEN** the cell displays orange/amber background with appropriate text styling

#### Scenario: Rejected cell remains gray strikethrough
- **WHEN** a student views the calendar grid with a rejected shift
- **THEN** the cell displays gray background with strikethrough text

