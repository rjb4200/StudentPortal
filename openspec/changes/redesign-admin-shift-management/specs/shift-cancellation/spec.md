## ADDED Requirements

### Requirement: Cancellation source tracking
The system SHALL track who initiated a shift cancellation using a `cancelled_by` field on the `schedules` table. Student cancellations of approved shifts SHALL set `cancelled_by = 'student'`. Admin cancellations SHALL set `cancelled_by = 'admin'`. Student cancellations of pending shifts SHALL NOT set `cancelled_by`, leaving it null.

#### Scenario: Student cancels approved shift with source tracking
- **WHEN** a student cancels an approved shift via the cancel modal
- **THEN** the `cancelled_by` field is set to `student` in addition to the existing status and note updates

#### Scenario: Admin cancels shift with source tracking
- **WHEN** an admin cancels a shift via the Action Required feed or Shift Management table
- **THEN** the `cancelled_by` field is set to `admin` in addition to the existing status and note updates

## MODIFIED Requirements

### Requirement: Student cancels own shift
A student SHALL be able to cancel a pending or approved shift by clicking the shift's date on the calendar grid. Clicking a date with an existing shift SHALL open a cancel confirmation modal showing the date, time range, and current status. Cancelling a pending shift SHALL take effect immediately with no additional input required and SHALL NOT set `cancelled_by`. Cancelling an approved shift SHALL require the student to enter a reason in a required note field before the cancellation is submitted, and SHALL set `cancelled_by = 'student'`. The system SHALL send a WFD-branded cancellation confirmation email to the student and notify active admins via email, including the note when present. Student-initiated cancellations of approved shifts SHALL also appear in the admin Action Required feed.

#### Scenario: Student cancels a pending shift
- **WHEN** a student clicks a calendar date with a pending shift and confirms cancellation in the modal
- **THEN** the schedule status is immediately set to `cancelled`, the calendar cell updates to cancelled styling, `cancelled_by` remains null, the student receives a cancellation confirmation email, and the cancellation does NOT appear in the admin Action Required feed

#### Scenario: Student cancels an approved shift with required note
- **WHEN** a student clicks a calendar date with an approved shift, enters a reason in the required note field, and confirms cancellation
- **THEN** the schedule status is immediately set to `cancelled`, `cancel_note` is stored with the student's reason, `cancelled_by` is set to `student`, the student receives a cancellation confirmation email, and the cancellation appears in the admin Action Required feed as a Cancel Request

#### Scenario: Student blocked from cancelling approved shift without note
- **WHEN** a student clicks a calendar date with an approved shift and attempts to confirm cancellation without entering a note
- **THEN** the cancel button is disabled or the submission is blocked with a message that a reason is required

#### Scenario: Admin notified of student cancellation
- **WHEN** a student cancels their own shift (pending or approved)
- **THEN** all active admins receive an email notification with the student's name, date, time, the word "Student-initiated", and the student's note when present

### Requirement: Admin cancels any shift with optional note
An admin SHALL be able to cancel any non-cancelled, non-rejected shift from the daily-ops Action Required feed or the Shift Management table. Before confirming, the admin MAY enter an optional note in a text input. The system SHALL store the note in `cancel_note`, set `cancelled_by = 'admin'`, and send a WFD-branded cancellation email to the student that includes the note when present. The note input SHALL display a hint that the student will see the note.

#### Scenario: Admin cancels a shift with a note
- **WHEN** an admin clicks "Cancel" on a pending or approved shift, enters a note "Class cancelled due to weather", and confirms
- **THEN** the schedule status is set to `cancelled`, `cancel_note` is stored, `cancelled_by` is set to `admin`, and the student receives an email with the note included

#### Scenario: Admin cancels a shift without a note
- **WHEN** an admin clicks "Cancel" on a pending or approved shift without entering a note and confirms
- **THEN** the schedule status is set to `cancelled`, `cancel_note` is null, `cancelled_by` is set to `admin`, and the student receives an email without a note section

#### Scenario: Note hint visible to admin
- **WHEN** an admin opens the cancel note input
- **THEN** a hint is displayed: "This note will be included in the cancellation email to the student"
