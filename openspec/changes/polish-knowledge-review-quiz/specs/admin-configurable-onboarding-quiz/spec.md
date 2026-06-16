## Purpose

Update the rule-before-question retry flow to use persistent feedback panels with hidden labels during selection, replacing the brief auto-dismiss behavior.

## MODIFIED Requirements

### Requirement: Rule-before-question retry flow
The student quiz SHALL show each rule before its photo question, require students to select all non-compliant photos from images alone (labels hidden during selection), and display a persistent feedback panel with per-photo results after any failed answer. The student must manually choose to review the rule or retry the question.

#### Scenario: Correct photo selection
- **WHEN** a student selects exactly all non-compliant photos for a rule
- **THEN** the system displays a brief "Correct!" success confirmation for approximately 1.5 seconds
- **AND** the system advances to the next rule or completes the quiz if no rules remain

#### Scenario: Incorrect photo selection
- **WHEN** a student submits an incorrect photo selection
- **THEN** the system displays a persistent feedback panel showing missed, correctly identified, and incorrectly selected photos with their labels and reasons
- **AND** the panel remains visible until the student clicks "Review Rule" to re-read the rule or "Retry" to re-attempt the question
