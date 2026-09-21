## MODIFIED Requirements

### Requirement: Schedule approved email
When an admin approves a scheduled shift day, the system SHALL attempt to send the student a WFD-branded email with the date, shift type, a link to their dashboard, and their personal calendar feed subscription URL from `calendar_feeds`. The schedule update and email delivery SHALL happen in a single server-side API route. The schedule update SHALL succeed even if email delivery fails.

#### Scenario: Admin approves a schedule request
- **WHEN** an admin clicks "Approve" on a pending schedule request in the daily ops panel
- **THEN** the system updates the schedule status to 'approved' and attempts to send the student an email with subject "Shift Approved — WFD EMS Student Portal" containing the date, shift type, a link to `/dashboard`, and the student's token-based calendar feed URL

### Requirement: Schedule rejected email
When an admin rejects a scheduled shift day, the system SHALL attempt to send the student a WFD-branded email with the date, shift type, instructions to contact their preceptor or the Training Major, and their personal calendar feed subscription URL. The rejection SHALL succeed even if email delivery fails.

#### Scenario: Admin rejects a schedule request
- **WHEN** an admin clicks "Reject" on a pending schedule request in the daily ops panel
- **THEN** the system updates the schedule status to 'rejected' and attempts to send the student an email with subject "Shift Request Update — WFD EMS Student Portal" containing the date, shift type, instructions to contact staff for more information, and the student's token-based calendar feed URL

### Requirement: Shift cancellation email
When a shift is cancelled (by student or admin), the system SHALL attempt to send a WFD-branded email to the student. Admin-initiated cancellations SHALL include the optional note text when present. Student-initiated cancellations SHALL include a "Student-initiated" label. All cancellation emails SHALL include the student's personal calendar feed subscription URL. The email SHALL use the standard WFD template with crimson header, logo, and credential-box body. The cancellation SHALL succeed even if email delivery fails.

#### Scenario: Admin cancels with note email
- **WHEN** an admin cancels a shift with the note "Class cancelled due to weather"
- **THEN** the student receives an email with subject "Shift Cancelled — WFD EMS Student Portal" containing the date, time range, the note text, and the student's token-based calendar feed URL

#### Scenario: Student self-cancels confirmation email
- **WHEN** a student cancels their own shift
- **THEN** the student receives an email with subject "Shift Cancelled — WFD EMS Student Portal" confirming their cancellation with the date, time range, and the student's token-based calendar feed URL

### Requirement: Shift reminder email
When the daily cron sends a shift reminder, the system SHALL attempt to send the student a WFD-branded email with the date, shift type, chief information, and their personal calendar feed subscription URL from `calendar_feeds`.

#### Scenario: Shift reminder includes calendar link
- **WHEN** the daily cron job sends a shift reminder to a student
- **THEN** the email includes the student's token-based calendar feed URL alongside the date, time, and reporting instructions

### Requirement: Instructor class approval email includes TEI calendar link
When an admin approves a class, the system SHALL attempt to send the associated instructor a WFD-branded class approval email that includes a class-specific student registration link and the training site's TEI calendar feed URL from `calendar_feeds`. The TEI token SHALL be auto-generated if one does not yet exist. Email delivery SHALL remain best-effort; class approval SHALL succeed regardless of email delivery outcome.

#### Scenario: Class approval email contains TEI calendar link
- **WHEN** an admin approves a pending class
- **THEN** the system attempts to send the associated instructor an email with subject "Class Approved — WFD EMS Student Portal"
- **AND** the email contains a student registration link and the training site's token-based TEI calendar feed URL
- **AND** the email explains how to subscribe to the TEI calendar
