## ADDED Requirements

### Requirement: Period block reason input
The period-block form SHALL display its own optional student-visible reason input. The form SHALL submit that value for every newly created date in the selected period without changing the selected-day block reason input or its draft value.

#### Scenario: Administrator explains a period closure
- **WHEN** an administrator enters a reason in the period-block form and blocks a valid range
- **THEN** the period request uses that reason for newly blocked dates

#### Scenario: Selected day changes during period setup
- **WHEN** an administrator enters a period reason and selects a different calendar day
- **THEN** the period reason remains unchanged
