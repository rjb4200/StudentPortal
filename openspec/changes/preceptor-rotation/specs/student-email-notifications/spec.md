## MODIFIED Requirements

### Requirement: Schedule approved email
When an admin approves a scheduled shift day, the system SHALL attempt to send the student a WFD-branded email with the date, shift type, a link to their dashboard, and their personal calendar feed subscription URL from `calendar_feeds`. When a preceptor has been assigned to the shift, the email SHALL also include the assigned preceptor's name as the student's likely preceptor; when none is assigned, the email SHALL omit any preceptor. The schedule update and email delivery SHALL happen in a single server-side API route. The schedule update SHALL succeed even if email delivery fails.

#### Scenario: Admin approves a schedule request
- **WHEN** an admin clicks "Approve" on a pending schedule request in the daily ops panel
- **THEN** the system updates the schedule status to 'approved' and attempts to send the student an email with subject "Shift Approved — WFD EMS Student Portal" containing the date, shift type, a link to `/dashboard`, and the student's token-based calendar feed URL

#### Scenario: Approved email names the assigned preceptor
- **WHEN** an admin approves a shift and assigns a preceptor to it
- **THEN** the approval email includes the assigned preceptor's name as the student's likely preceptor

#### Scenario: Approved email omits the preceptor when none is assigned
- **WHEN** an admin approves a shift without assigning a preceptor
- **THEN** the approval email contains no preceptor information
