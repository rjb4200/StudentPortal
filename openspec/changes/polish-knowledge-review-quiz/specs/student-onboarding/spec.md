## MODIFIED Requirements

### Requirement: Knowledge gate safety quiz
The system SHALL present a photo-grid compliance quiz where students visually inspect photographs and tap every photo that is not in compliance with the displayed rule. Photo labels and reasons SHALL be hidden during selection and revealed only after submission. The system SHALL show slide transitions between rule, question, and feedback modes. Three or more failed attempts on a rule followed by a successful pass SHALL trigger an admin flag.

#### Scenario: Correct photo selection
- **WHEN** a student correctly selects all non-compliant photos for a rule based on visual inspection alone
- **THEN** the system displays a "Correct!" success indicator and advances to the next rule or completion

#### Scenario: Incorrect photo selection
- **WHEN** a student submits an incorrect photo selection
- **THEN** the system displays a persistent feedback panel showing per-photo results with labels and reasons
- **AND** the feedback panel does not auto-dismiss

#### Scenario: Image load failure
- **WHEN** a quiz photo image fails to load
- **THEN** the system displays a branded fallback placeholder instead of a broken image icon
- **AND** the quiz remains functional

#### Scenario: Knowledge gate completion
- **WHEN** a student correctly completes all quiz rules
- **THEN** the system presents the completion screen and allows the student to finish onboarding

### Requirement: Image grid quiz for acceptable/unacceptable actions
The system SHALL present a grid of photos for each rule where students visually identify non-compliant images. Photo labels and reasons SHALL be hidden during the selection phase and revealed only in the feedback panel after submission.

#### Scenario: Correct image classification
- **WHEN** a student correctly identifies all non-compliant photos in the grid by visual inspection
- **THEN** the system displays a success micro-feedback and advances past this rule

#### Scenario: Incorrect image classification
- **WHEN** a student submits classifications with incorrect answers
- **THEN** the system displays a persistent feedback panel showing missed and incorrect selections with per-photo labels and reasons
- **AND** the student may choose to review the rule or retry
