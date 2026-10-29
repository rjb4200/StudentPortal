## ADDED Requirements

### Requirement: TEI postal fields validate US formats
The TEI registration workflow SHALL require State to be a supported US postal abbreviation and ZIP code to be a five-digit ZIP or ZIP+4 value before the registrant advances or submits registration.

#### Scenario: Invalid ZIP format is blocked
- **WHEN** a registrant enters a ZIP value that is neither five digits nor ZIP+4
- **THEN** the active TEI step displays a ZIP validation error
- **AND** the registrant cannot advance or submit

#### Scenario: State is selected from supported values
- **WHEN** a registrant completes the TEI address fields
- **THEN** State is selected from the supported US postal abbreviations
