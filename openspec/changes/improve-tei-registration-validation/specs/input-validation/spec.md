## ADDED Requirements

### Requirement: TEI registration validates each workflow step
The TEI registration workflow SHALL validate the data collected for the current step before allowing a registrant to advance. Validation feedback SHALL identify the affected field or requirement and SHALL keep the registrant on the invalid step.

#### Scenario: Invalid class date range is blocked before MOU review
- **WHEN** a registrant selects an end-of-ride-time date before the beginning-of-class date
- **THEN** the class step displays an explanatory date error
- **AND** the registrant is not advanced to MOU review

#### Scenario: Invalid new instructor details are blocked before class entry
- **WHEN** a registrant enters invalid required instructor data
- **THEN** the instructor step displays the applicable validation feedback
- **AND** the registrant is not advanced to class entry

### Requirement: TEI registration returns actionable validation errors
The TEI registration API SHALL return HTTP 400 validation failures with a readable message and the paths of invalid fields. The registration page SHALL display the errors on the applicable workflow step and make that step active.

#### Scenario: Server validation finds an invalid previous step
- **WHEN** final registration submission contains invalid TEI, instructor, or class data
- **THEN** the API returns the invalid field paths and descriptive messages
- **AND** the registration page returns the registrant to the earliest affected step
