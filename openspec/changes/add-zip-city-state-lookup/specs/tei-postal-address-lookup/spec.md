## Purpose

Provide TEI registrants with ZIP-derived City and State suggestions while preserving their ability to enter an address accurately.

## ADDED Requirements

### Requirement: TEI ZIP lookup suggests City and State
The TEI registration form SHALL look up a valid US ZIP code after entry and provide the matching City and State. A successful lookup SHALL select the matched State and SHALL autofill City only when the City field is empty.

#### Scenario: Empty City is autofilled
- **WHEN** a registrant enters ZIP code `40360` and leaves the ZIP field while City is empty
- **THEN** the form fills City with `Owingsville`
- **AND** selects `KY` as the State

#### Scenario: Existing City is preserved
- **WHEN** a registrant enters a valid ZIP code while City already contains a value
- **THEN** the form preserves the entered City
- **AND** offers a one-click suggestion using the ZIP-derived City and State

#### Scenario: ZIP lookup fails
- **WHEN** a syntactically valid ZIP code cannot be found
- **THEN** the form identifies that the ZIP code was not found
- **AND** does not overwrite City or State

### Requirement: ZIP lookup respects registrant input
The TEI registration form SHALL keep City editable after a ZIP lookup and SHALL allow the registrant to dismiss or apply a suggested City and State.

#### Scenario: Registrant applies suggestion
- **WHEN** City contains a value and a ZIP lookup returns a suggested City and State
- **THEN** the registrant can apply the suggestion with one action
- **AND** City and State are updated to the suggested values
