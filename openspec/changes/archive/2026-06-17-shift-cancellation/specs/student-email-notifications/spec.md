## ADDED Requirements

### Requirement: Shift cancellation email
When a shift is cancelled (by student or admin), the system SHALL send a WFD-branded email to the student. Admin-initiated cancellations SHALL include the optional note text when present. Student-initiated cancellations SHALL include a "Student-initiated" label. The email SHALL use the standard WFD template with crimson header, logo, and credential-box body.

#### Scenario: Admin cancels with note email
- **WHEN** an admin cancels a shift with the note "Class cancelled due to weather"
- **THEN** the student receives an email with subject "Shift Cancelled — WFD EMS Student Portal" containing the date, time range, and the note text

#### Scenario: Student self-cancels confirmation email
- **WHEN** a student cancels their own shift
- **THEN** the student receives an email with subject "Shift Cancelled — WFD EMS Student Portal" confirming their cancellation with the date and time range

### Requirement: Admin notification on student cancellation
When a student cancels their own shift, the system SHALL notify all active admins via email. The email SHALL include the student's name, shift date, time range, and a "Student-initiated" label.

#### Scenario: Admin receives student cancellation notification
- **WHEN** a student cancels their own shift
- **THEN** all active admins receive an email with subject "Student Shift Cancellation — WFD EMS" containing the student's name, shift date, time, and the word "Student-initiated"
