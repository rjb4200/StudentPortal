## ADDED Requirements

### Requirement: Schedule approved SMS queueing
When an admin approves a scheduled shift day, the system SHALL preserve existing best-effort email behavior and SHALL also enqueue a best-effort SMS confirmation for the student when student shift approval SMS is enabled and the student has opted in to SMS.

#### Scenario: Admin approves schedule for SMS opted-in student
- **WHEN** an admin approves a pending schedule request for a student with SMS opt-in and a valid phone number
- **THEN** the system updates the schedule status to `approved`
- **AND** the system attempts the existing schedule approval email behavior
- **AND** the system enqueues an SMS approval confirmation for the student

#### Scenario: Admin approves schedule for student without SMS opt-in
- **WHEN** an admin approves a pending schedule request for a student without SMS opt-in
- **THEN** the system updates the schedule status to `approved`
- **AND** the system does not enqueue a student SMS confirmation

#### Scenario: SMS queueing fails during approval
- **WHEN** the schedule status update succeeds but SMS queueing fails
- **THEN** the approval API still returns success for the schedule update
- **AND** the failure is logged for server-side troubleshooting

### Requirement: Day-before shift reminder queueing
When an admin approves a student shift, the system SHALL queue a day-before SMS reminder for opted-in students when reminders are enabled. The queued reminder SHALL be cancelled or prevented from sending if the shift is later cancelled or rejected before the reminder is sent.

#### Scenario: Reminder queued after approval
- **WHEN** an admin approves a shift for an opted-in student and day-before reminders are enabled
- **THEN** the system creates a pending SMS reminder scheduled for the configured reminder time on the day before the shift

#### Scenario: Approved shift is cancelled before reminder
- **WHEN** an approved shift has a pending SMS reminder and the shift is cancelled before the reminder is sent
- **THEN** the system cancels or excludes that reminder from delivery
