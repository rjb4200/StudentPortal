## MODIFIED Requirements

### Requirement: Account approved email
When an admin approves a student, the system SHALL attempt to send the student a WFD-branded email notifying them their account is active. The email SHALL use the same HTML template as the onboarding credential email with the WFD logo, crimson `#A40104` header band, charcoal `#1C1C1E` bottom border, credential-style body box, and a "Go to Student Portal Login" CTA button linking to `/login`. The email SHALL include general instructions to report to Station 1 at 0700 for assignment by the on-duty Brigade Chief and SHALL include the active Station 1 map link when configured. Email delivery is best-effort; the approval operation SHALL succeed regardless of whether the email is delivered.

#### Scenario: Admin approves a student
- **WHEN** an admin successfully approves a pending student via the approve-student API
- **THEN** the system attempts to send an email to the student at their registered address with subject "WFD EMS Student Portal — Account Approved" and a body that includes the student's name, confirmation that their account is active, Station 1 reporting instructions, an active map link when configured, and a link to `/login`

#### Scenario: Student already approved
- **WHEN** an admin attempts to approve a student who is already certified
- **THEN** the system returns success without sending a duplicate email

#### Scenario: Email provider unavailable during approval
- **WHEN** an admin approves a student and the email provider is unreachable
- **THEN** the student status is updated to `certified` and the API returns `{ success: true }`
- **AND** the email failure is logged
