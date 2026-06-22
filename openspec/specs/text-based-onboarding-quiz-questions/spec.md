# text-based-onboarding-quiz-questions Specification

## Purpose
Support text-choice onboarding quiz questions that do not require photos while preserving the existing onboarding quiz flow, feedback, retry, completion, and admin flag behavior.
## Requirements
### Requirement: Text-choice onboarding quiz rules
The system SHALL support onboarding quiz rules whose question type is `text_choice`. Text-choice rules SHALL present selectable text answer options without requiring photo image URLs.

#### Scenario: Student answers text-choice rule
- **WHEN** a student reaches an active `text_choice` quiz rule
- **THEN** the question screen displays text answer options instead of photo cards
- **AND** the student can select one or more answer options before submitting

#### Scenario: Text-choice rule requires no photos
- **WHEN** an active quiz rule is configured as `text_choice`
- **THEN** the rule can be included in the student quiz without any photo image URLs

### Requirement: Text-choice feedback
The system SHALL provide feedback for incorrect text-choice submissions using the same retry flow as photo-grid questions. Feedback SHALL identify missed correct options, correctly selected options, and incorrectly selected options, and SHALL show each option's explanation.

#### Scenario: Incorrect text-choice submission
- **WHEN** a student submits an incorrect text-choice answer
- **THEN** the system displays persistent feedback showing missed, correctly selected, and incorrectly selected text options with explanations
- **AND** the student may review the rule or retry the question

### Requirement: Mixed quiz sequence
The system SHALL allow photo-grid and text-choice rules to appear together in one onboarding quiz sequence ordered by admin-defined rule sort order.

#### Scenario: Mixed question types in sequence
- **WHEN** active quiz rules include both `photo_grid` and `text_choice` rules
- **THEN** the student knowledge gate displays each rule in configured order
- **AND** each rule renders the question UI appropriate to its question type

### Requirement: Existing quiz behavior preserved
The system SHALL preserve existing photo-grid behavior, retry behavior, success behavior, completion behavior, and admin quiz flag behavior when text-choice rules are added.

#### Scenario: Repeated text-choice failures create quiz flag
- **WHEN** a student fails a text-choice rule at least three times and then passes it
- **THEN** the system creates or updates an admin quiz flag using the same flagging behavior as photo-grid rules

#### Scenario: Existing photo-grid rule still works
- **WHEN** a student reaches an existing active photo-grid rule
- **THEN** the system displays the existing photo-grid selection experience with image load protection unchanged
