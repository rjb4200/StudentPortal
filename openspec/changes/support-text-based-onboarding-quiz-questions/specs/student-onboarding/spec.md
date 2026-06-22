## MODIFIED Requirements

### Requirement: Knowledge gate safety quiz

The system SHALL present an onboarding compliance quiz where students review each displayed rule and answer its configured question type. The quiz SHALL support photo-grid questions where students visually inspect photographs and tap every photo that is not in compliance, and text-choice questions where students select the correct text answer options without photos. Photo labels and reasons SHALL be hidden during photo-grid selection and revealed only after submission. The system SHALL show slide transitions between rule, question, and feedback modes. Three or more failed attempts on a rule followed by a successful pass SHALL trigger an admin flag. If a photo-grid quiz image fails to load, the system SHALL clearly show the failed media state and SHALL prevent students from submitting an answer for that photo-grid rule based on missing media.

#### Scenario: Correct photo selection

- **WHEN** a student correctly selects all non-compliant photos for a photo-grid rule based on visual inspection alone
- **THEN** the system displays a "Correct!" success indicator and advances to the next rule or completion

#### Scenario: Correct text-choice selection

- **WHEN** a student correctly selects all correct text options for a text-choice rule
- **THEN** the system displays a "Correct!" success indicator and advances to the next rule or completion

#### Scenario: Incorrect photo selection

- **WHEN** a student submits an incorrect photo selection
- **THEN** the system displays a persistent feedback panel showing per-photo results with labels and reasons
- **AND** the feedback panel does not auto-dismiss

#### Scenario: Incorrect text-choice selection

- **WHEN** a student submits an incorrect text-choice selection
- **THEN** the system displays a persistent feedback panel showing per-option results with text labels and explanations
- **AND** the feedback panel does not auto-dismiss

#### Scenario: Image load failure

- **WHEN** a quiz photo image fails to load for a photo-grid rule
- **THEN** the system displays a branded fallback placeholder instead of a broken image icon
- **AND** the affected photo cannot be selected
- **AND** submitting the current rule is blocked with a clear media-unavailable message

#### Scenario: Text-choice question without photos

- **WHEN** a text-choice quiz rule has no photo image URLs
- **THEN** the rule still renders and can be completed using its text answer options

#### Scenario: Knowledge gate completion

- **WHEN** a student correctly completes all quiz rules
- **THEN** the system presents the completion screen and allows the student to finish onboarding

### Requirement: Image grid quiz for acceptable/unacceptable actions
The system SHALL present a grid of photos for photo-grid rules where students visually identify non-compliant images. Photo labels and reasons SHALL be hidden during the selection phase and revealed only in the feedback panel after submission. This requirement SHALL apply only to rules configured as `photo_grid`.

#### Scenario: Correct image classification
- **WHEN** a student correctly identifies all non-compliant photos in the grid by visual inspection
- **THEN** the system displays a success micro-feedback and advances past this rule

#### Scenario: Incorrect image classification
- **WHEN** a student submits classifications with incorrect answers
- **THEN** the system displays a persistent feedback panel showing missed and incorrect selections with per-photo labels and reasons
- **AND** the student may choose to review the rule or retry
