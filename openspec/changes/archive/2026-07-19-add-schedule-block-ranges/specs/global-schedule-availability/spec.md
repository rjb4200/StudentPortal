## ADDED Requirements

### Requirement: Global date-range schedule blocks
The system SHALL let an authorized admin create global schedule blocks for every calendar date in an inclusive start-to-end range through one range action. The range action SHALL accept an optional student-visible reason, create independent daily blocks using the existing availability model, and preserve any date that was already blocked.

#### Scenario: Admin blocks a consecutive period
- **WHEN** an admin submits a valid start date of August 3 and end date of August 16 with a reason
- **THEN** the system creates a global block for every date from August 3 through August 16 inclusive with that reason

#### Scenario: Single-day range remains valid
- **WHEN** an admin submits the same valid date as the start and end of a range
- **THEN** the system creates one global block using the same behavior as a single-date block

#### Scenario: Existing blocks are preserved
- **WHEN** an admin creates a range containing dates that are already globally blocked
- **THEN** the system leaves those existing block records and their reasons unchanged
- **AND** creates blocks only for the previously open dates in the range

#### Scenario: Invalid range is rejected
- **WHEN** an admin submits an end date before the start date or a range exceeding the configured maximum length
- **THEN** the system rejects the range without creating any blocks

### Requirement: Range block impact preview
Before an admin confirms a date-range block, the system SHALL show the inclusive count of dates to be evaluated, the count of dates already blocked, and counts of existing pending and approved schedules within the range. The preview SHALL state that existing schedules remain unchanged.

#### Scenario: Range contains existing schedules
- **WHEN** an admin selects a valid date range containing pending and approved schedules
- **THEN** the preview displays the pending and approved schedule counts before the admin creates the blocks
- **AND** creating the blocks leaves those schedules in their current states

#### Scenario: Range contains existing blocks
- **WHEN** an admin selects a valid date range that includes already-blocked dates
- **THEN** the preview identifies the number of already-blocked dates and explains that they will be preserved

### Requirement: Individual reopening after range blocking
Every date created through a range action SHALL remain removable through the existing individual-date block removal action. Removing one date SHALL not change blocks on other dates from the original range.

#### Scenario: Admin reopens an exception day
- **WHEN** an admin removes one blocked date that was created as part of a range
- **THEN** new shift requests for that date become eligible subject to normal scheduling rules
- **AND** all other dates from the original range remain blocked
