## ADDED Requirements

### Requirement: Student roster expiration countdown badge
The admin daily operations Student Roster SHALL display a color-coded, number-only expiration countdown badge for each student with an `access_until` value.

#### Scenario: Certified student has remaining access days
- **WHEN** an admin views the Student Roster and a student has future `access_until` value
- **THEN** the roster displays a zero-padded three-digit countdown badge such as `120`, `115`, or `001`

#### Scenario: Countdown badge communicates urgency
- **WHEN** an admin views countdown badges in the Student Roster
- **THEN** each countdown badge is colored according to remaining-day urgency

#### Scenario: Countdown badge has hover text
- **WHEN** an admin hovers over a countdown badge
- **THEN** the system displays hover text explaining that the number is the student's days remaining until access expiration

#### Scenario: Missing access expiration date
- **WHEN** an admin views a student without an `access_until` value
- **THEN** the roster does not display an expiration countdown badge for that student
