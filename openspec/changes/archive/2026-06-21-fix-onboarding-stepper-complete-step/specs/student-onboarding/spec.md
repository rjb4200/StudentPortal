## ADDED Requirements

### Requirement: Onboarding Progress Indicator

The system SHALL display an onboarding progress indicator that represents the full student onboarding flow, including Register, Legal, Resources, Review, and Complete.

#### Scenario: Completion step is represented

- **WHEN** a student reaches the final onboarding completion screen
- **THEN** the progress indicator shows step 5 of 5
- **AND** the current step label is `Complete`
