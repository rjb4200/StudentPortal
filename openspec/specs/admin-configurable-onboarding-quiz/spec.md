# admin-configurable-onboarding-quiz

**Purpose:** Allow training staff to manage the onboarding compliance quiz (rules, question types, answer options, correct answers, and active state) from the Admin Command Center without code changes or redeploys.
## Requirements

### Requirement: Intentional quiz configuration changes
The quiz configuration interface SHALL require an explicit create or edit action before presenting editable rule or answer-option fields. It SHALL require an explicit save action before a rule, option, or activation-state change becomes available to future onboarding sessions.

#### Scenario: Administrator views quiz configuration
- **WHEN** an administrator selects an existing quiz rule or answer option
- **THEN** its stored configuration is not immediately editable

#### Scenario: Administrator saves quiz configuration
- **WHEN** an administrator explicitly edits valid quiz configuration and saves it
- **THEN** the change is persisted and applies to future onboarding quiz sessions according to its active state

### Requirement: Admin-managed quiz rules
The system SHALL allow admin users to create, edit, reorder, activate, deactivate, and delete onboarding quiz rules from the Admin Command Center. Each rule SHALL have a question type of `photo_grid` or `text_choice`. Reordering SHALL use ▲/▼ buttons with recalculation to guarantee unique sort_order values.

#### Scenario: Create quiz rule
- **WHEN** an admin creates a rule with title, rule text, instruction, question type, sort order, and active state
- **THEN** the rule is stored and available for quiz configuration management
- **AND** the new rule's sort_order is set to the maximum existing sort_order plus 10

#### Scenario: Reorder quiz rule up
- **WHEN** an admin clicks ▲ on a quiz rule
- **THEN** the rule swaps position with the rule above it
- **AND** all rules' sort_order values are reassigned to clean multiples of 10

#### Scenario: Deactivate quiz rule
- **WHEN** an admin deactivates a rule
- **THEN** the rule is hidden from future student onboarding quiz sessions

### Requirement: Admin-managed quiz photos
The system SHALL allow admin users to manage answer options for each quiz rule. For `photo_grid` rules, admins SHALL manage 4-6 active photo options, including label, image URL, non-compliant answer flag, explanation, sort order, and active state. For `text_choice` rules, admins SHALL manage active text options, including option text, correct/non-compliant answer flag, explanation, sort order, and active state, without requiring image URLs. Reordering SHALL use ▲/▼ buttons with recalculation. Answer options SHALL be loaded and sorted scoped to their parent rule.

#### Scenario: Add photo answer
- **WHEN** an admin adds a photo option to a `photo_grid` rule and marks whether it is non-compliant
- **THEN** the photo option is included in that rule's student question when active
- **AND** the new option's sort_order is set to the maximum existing sort_order within that rule plus 10

#### Scenario: Add text answer
- **WHEN** an admin adds a text option to a `text_choice` rule and marks whether it is a correct/non-compliant answer
- **THEN** the text option is included in that rule's student question when active
- **AND** no image URL is required for the option
- **AND** the new option's sort_order is set to the maximum existing sort_order within that rule plus 10

#### Scenario: Reorder photo within rule
- **WHEN** an admin clicks ▲ or ▼ on an answer option within a rule
- **THEN** the option swaps position within that rule's option list only
- **AND** all options within that rule are reassigned clean multiples of 10

#### Scenario: Invalid active rule content
- **WHEN** an admin attempts to activate a `photo_grid` rule with fewer than 4 active photo options, more than 6 active photo options, zero non-compliant photo options, or an active photo option without an image URL
- **THEN** the system prevents activation and displays a validation message

#### Scenario: Invalid active text-choice rule content
- **WHEN** an admin attempts to activate a `text_choice` rule with fewer than 2 active text options, zero correct/non-compliant text options, or an active text option without option text
- **THEN** the system prevents activation and displays a validation message

### Requirement: Student quiz uses active database configuration
The onboarding knowledge gate SHALL load active quiz rules and active answer options from Supabase, ordered by admin-defined sort order. Answer options SHALL be loaded scoped to their parent rule and interpreted based on the parent rule's question type.

#### Scenario: Student starts quiz
- **WHEN** a student reaches the knowledge gate
- **THEN** the system displays active quiz rules from Supabase in configured order
- **AND** options for each rule are loaded and ordered within that rule's scope
- **AND** each rule is rendered according to its configured question type

#### Scenario: Inactive content hidden
- **WHEN** a rule or answer option is inactive
- **THEN** it is not shown to students in the onboarding quiz

### Requirement: Rule-before-question retry flow
The student quiz SHALL show each rule before its question, require students to select the correct answer options for the configured question type, and display a persistent feedback panel with per-option results after any failed answer. For `photo_grid` rules, labels and reasons SHALL remain hidden during selection. The student must manually choose to review the rule or retry the question.

#### Scenario: Correct photo selection
- **WHEN** a student selects exactly all non-compliant photos for a photo-grid rule
- **THEN** the system displays a brief "Correct!" success confirmation for approximately 1.5 seconds
- **AND** the system advances to the next rule or completes the quiz if no rules remain

#### Scenario: Correct text-choice selection
- **WHEN** a student selects exactly all correct/non-compliant text options for a text-choice rule
- **THEN** the system displays a brief "Correct!" success confirmation for approximately 1.5 seconds
- **AND** the system advances to the next rule or completes the quiz if no rules remain

#### Scenario: Incorrect photo selection
- **WHEN** a student submits an incorrect photo selection
- **THEN** the system displays a persistent feedback panel showing missed, correctly identified, and incorrectly selected photos with their labels and reasons
- **AND** the panel remains visible until the student clicks "Review Rule" to re-read the rule or "Retry" to re-attempt the question

#### Scenario: Incorrect text-choice selection
- **WHEN** a student submits an incorrect text-choice selection
- **THEN** the system displays a persistent feedback panel showing missed, correctly identified, and incorrectly selected text options with their explanations
- **AND** the panel remains visible until the student clicks "Review Rule" to re-read the rule or "Retry" to re-attempt the question

### Requirement: Quiz configuration security
The system SHALL restrict quiz configuration writes to admin users and allow onboarding users to read only active quiz rules and active answer options.

#### Scenario: Anonymous onboarding read
- **WHEN** an unauthenticated student accesses the knowledge gate
- **THEN** the student can read active quiz rules and active answer options only

#### Scenario: Non-admin write blocked
- **WHEN** a non-admin user attempts to create, update, or delete quiz configuration
- **THEN** the database rejects the operation
