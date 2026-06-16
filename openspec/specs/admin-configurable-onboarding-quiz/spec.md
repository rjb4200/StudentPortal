# admin-configurable-onboarding-quiz

**Purpose:** Allow training staff to manage the onboarding compliance quiz (rules, photos, correct answers, and active state) from the Admin Command Center without code changes or redeploys.
## Requirements
### Requirement: Admin-managed quiz rules
The system SHALL allow admin users to create, edit, reorder, activate, deactivate, and delete onboarding quiz rules from the Admin Command Center.

#### Scenario: Create quiz rule
- **WHEN** an admin creates a rule with title, rule text, instruction, sort order, and active state
- **THEN** the rule is stored and available for quiz configuration management

#### Scenario: Deactivate quiz rule
- **WHEN** an admin deactivates a rule
- **THEN** the rule is hidden from future student onboarding quiz sessions

### Requirement: Admin-managed quiz photos
The system SHALL allow admin users to manage 4-6 photos for each quiz rule, including label, image URL, non-compliant answer flag, explanation, sort order, and active state.

#### Scenario: Add photo answer
- **WHEN** an admin adds a photo to a rule and marks whether it is non-compliant
- **THEN** the photo is included in that rule's student question when active

#### Scenario: Invalid active rule content
- **WHEN** an admin attempts to activate a rule with fewer than 4 active photos, more than 6 active photos, or zero non-compliant photos
- **THEN** the system prevents activation and displays a validation message

### Requirement: Student quiz uses active database configuration
The onboarding knowledge gate SHALL load active quiz rules and active quiz photos from Supabase, ordered by admin-defined sort order.

#### Scenario: Student starts quiz
- **WHEN** a student reaches the knowledge gate
- **THEN** the system displays active quiz rules from Supabase in configured order

#### Scenario: Inactive content hidden
- **WHEN** a rule or photo is inactive
- **THEN** it is not shown to students in the onboarding quiz

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

### Requirement: Quiz configuration security
The system SHALL restrict quiz configuration writes to admin users and allow onboarding users to read only active quiz rules and photos.

#### Scenario: Anonymous onboarding read
- **WHEN** an unauthenticated student accesses the knowledge gate
- **THEN** the student can read active quiz rules and photos only

#### Scenario: Non-admin write blocked
- **WHEN** a non-admin user attempts to create, update, or delete quiz configuration
- **THEN** the database rejects the operation

