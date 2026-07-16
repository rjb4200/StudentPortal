## ADDED Requirements

### Requirement: Fixed 24/48 crew rotation
The system SHALL derive a department crew shift for each calendar date from a repeating three-day rotation anchored at 0700 America/New_York on July 16, 2026. The rotation SHALL identify First Shift with R Brown and orange presentation, Second Shift with S Bellot and yellow presentation, and Third Shift with M Martin and gray presentation. A ride scheduled on a date SHALL use the crew shift that begins at 0700 on that date, including a full ride that ends at 0700 the following day.

#### Scenario: Rotation starts on the anchor date
- **WHEN** the system derives the crew shift for July 16, 2026
- **THEN** it identifies First Shift with R Brown and orange presentation

#### Scenario: Rotation repeats after three days
- **WHEN** the system derives the crew shift for July 19, 2026
- **THEN** it identifies First Shift with R Brown and orange presentation

#### Scenario: Full ride keeps its starting-date crew
- **WHEN** a student has a full 0700-to-0700 ride dated July 18, 2026
- **THEN** the system identifies Third Shift with M Martin for that ride

### Requirement: Rotation tag on student calendar
The student dashboard monthly calendar SHALL display a compact crew-shift tag for every visible date cell. The tag SHALL include the shift label and on-duty Chief and SHALL use the crew presentation color without replacing the existing student schedule status treatment.

#### Scenario: Calendar date without a student ride
- **WHEN** a student views a calendar date with no personal schedule record
- **THEN** the date cell displays the applicable crew-shift tag

#### Scenario: Calendar date with an approved ride
- **WHEN** a student views a calendar date with an approved personal ride
- **THEN** the date cell displays both the approved ride status and the applicable crew-shift tag

### Requirement: Rotation tag in pending schedule approvals
The Admin Daily Operations pending schedule request entry SHALL display the applicable crew-shift tag beside the requested date and time before staff approve, reject, or cancel the request.

#### Scenario: Admin reviews a pending ride
- **WHEN** an admin views a pending schedule request dated July 17, 2026
- **THEN** the request displays Second Shift and S Bellot with the yellow crew presentation
