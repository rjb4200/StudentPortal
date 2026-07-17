## Why

Study materials are reference content students need throughout training, not a prerequisite for completing onboarding. Requiring resource review before the quiz slows registration without providing a meaningful completion signal.

## What Changes

- Remove Resources as a required onboarding step and advance students from Legal directly to the Policy and Protocol Review quiz.
- Change the onboarding progress indicator to Register, Legal, Review, and Submitted.
- Add Resources as a dashboard section available to both pending and certified students.
- Replace the dashboard's Preceptors & Evaluations section with Resources while leaving preceptor and evaluation functionality available for future reintroduction.
- Present resources as an ongoing reference library without a review attestation or onboarding advancement controls.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `student-onboarding`: Remove the resource-library gate from the onboarding sequence and update onboarding progress.
- `student-dashboard`: Replace Preceptors & Evaluations with an always-available Resources dashboard section.
- `admin-configurable-resource-library`: Render the active, admin-managed resource library as a reusable student reference surface rather than an onboarding-only step.

## Impact

- Affected code: onboarding flow and steppers, resource-library presentation, dashboard section navigation, and preceptor/evaluation imports.
- APIs and database: no schema or API changes expected; existing resource categories and documents remain the source of truth.
- Access: pending students can access Resources, Messages, and Calendar Feed; scheduling remains certification-gated.
