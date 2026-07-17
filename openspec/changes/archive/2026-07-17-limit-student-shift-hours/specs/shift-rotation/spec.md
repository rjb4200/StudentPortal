## MODIFIED Requirements

### Requirement: Fixed 24/48 crew rotation
The system SHALL derive a department crew shift for each calendar date from a repeating three-day rotation anchored at 0700 America/New_York on July 16, 2026. The rotation SHALL identify First Shift with R Brown and orange presentation, Second Shift with S Bellot and yellow presentation, and Third Shift with M Martin and gray presentation. A ride scheduled on a date SHALL use the crew shift that begins at 0700 on that date.

#### Scenario: Rotation starts on the anchor date
- **WHEN** the system derives the crew shift for July 16, 2026
- **THEN** it identifies First Shift with R Brown and orange presentation

#### Scenario: Rotation repeats after three days
- **WHEN** the system derives the crew shift for July 19, 2026
- **THEN** it identifies First Shift with R Brown and orange presentation
