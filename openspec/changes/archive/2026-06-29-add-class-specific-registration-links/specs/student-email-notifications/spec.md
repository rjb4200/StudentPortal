## ADDED Requirements

### Requirement: Instructor class approval email includes student registration link
When an admin approves a class, the system SHALL attempt to send the associated instructor a WFD-branded class approval email that includes a class-specific student registration link. The link SHALL use the canonical production site URL and the approved class id so the instructor can forward it to students for class-specific onboarding. Email delivery SHALL remain best-effort; class approval SHALL succeed regardless of email delivery outcome.

#### Scenario: Class approval email contains registration link
- **WHEN** an admin approves a pending class
- **THEN** the system attempts to send the associated instructor an email with subject "Class Approved — WFD EMS Student Portal"
- **AND** the email contains a student registration link in the form `https://studentportal.winchesterfireems.com/onboarding?class=<training_class_id>`
- **AND** the email explains that the instructor can share the link with students for that class

#### Scenario: Already active class does not send duplicate link email
- **WHEN** an admin approves a class that is already active
- **THEN** the system does not send a duplicate class approval email

#### Scenario: Class approval succeeds if link email fails
- **WHEN** an admin approves a class and the instructor approval email cannot be delivered
- **THEN** the class status update still succeeds
- **AND** the email delivery failure is logged
