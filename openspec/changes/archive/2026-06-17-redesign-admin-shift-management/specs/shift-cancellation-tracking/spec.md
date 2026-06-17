## ADDED Requirements

### Requirement: Cancelled-by field on schedules
The `schedules` table SHALL include a `cancelled_by` text column that records who initiated a shift cancellation. Valid values SHALL be `student` and `admin`. The field SHALL be null for schedules that are not cancelled.

#### Scenario: Student-initiated cancellation tracked
- **WHEN** a student cancels their own approved shift
- **THEN** the `cancelled_by` field is set to `student` on the schedule record

#### Scenario: Admin-initiated cancellation tracked
- **WHEN** an admin cancels a shift (pending or approved) via either the Action Required feed or the Shift Management table
- **THEN** the `cancelled_by` field is set to `admin` on the schedule record

#### Scenario: Pending shift cancelled by student is not tracked
- **WHEN** a student cancels their own pending shift
- **THEN** the `cancelled_by` field remains null (the cancellation is immediate and requires no admin attention)

#### Scenario: Non-cancelled schedules have null cancelled_by
- **WHEN** a schedule is created, approved, or rejected
- **THEN** the `cancelled_by` field is null

### Requirement: Student cancellation visibility in Action Required feed
The admin Action Required feed SHALL display student-initiated cancellations of approved shifts. Each entry SHALL show a distinct Cancel Request badge, the student name, date, time, any cancel note from the student, and a "Cancel Shift" action button. These entries SHALL be visually differentiated from other Action Required item types.

#### Scenario: Student cancels approved shift appears in feed
- **WHEN** a student cancels an approved shift (setting `cancelled_by = 'student'`)
- **THEN** a Cancel Request entry appears in the admin Action Required feed with an amber/orange badge, the student's name, date, time, and cancel note

#### Scenario: Admin processes student cancellation from feed
- **WHEN** an admin clicks "Cancel Shift" on a student-initiated cancellation entry in the Action Required feed
- **THEN** the `cancelled_by` field is updated to `admin`, the entry disappears from the Action Required feed, and the schedule remains visible in the Shift Management Cancelled tab

#### Scenario: Student cancels pending shift does not appear in feed
- **WHEN** a student cancels a pending shift (cancelled_by remains null)
- **THEN** the cancellation does not appear in the Action Required feed

#### Scenario: Admin-initiated cancellation does not appear in feed
- **WHEN** an admin cancels a shift (setting `cancelled_by = 'admin'`)
- **THEN** the cancellation does not appear in the Action Required feed
