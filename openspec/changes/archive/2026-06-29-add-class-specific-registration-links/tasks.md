## 1. Approval Email Link

- [x] 1.1 Update class approval lookup to include the approved `training_classes.id` needed for link generation.
- [x] 1.2 Build the class-specific registration URL from the configured canonical site URL and `/onboarding?class=<training_class_id>`.
- [x] 1.3 Update `buildInstructorClassApprovedEmail` to accept and render the student registration link with clear instructor-facing sharing instructions.
- [x] 1.4 Preserve best-effort email behavior so class approval succeeds even if email delivery fails.

## 2. Onboarding Link Handling

- [x] 2.1 Read the optional `class` query parameter on the onboarding page and pass it into the registration form.
- [x] 2.2 When the class id matches a visible option from `/api/training-classes/options`, preselect the class and show explanatory locked-link copy.
- [x] 2.3 Prevent accidental class changes for a valid class-specific link while keeping `training_class_id` in submit state.
- [x] 2.4 When the class id does not match a visible option, show a clear unavailable-link message and avoid silently selecting the class.
- [x] 2.5 Ensure saved onboarding resume behavior does not bypass a newly opened class-specific registration link.

## 3. Validation And Tests

- [x] 3.1 Update email template tests to assert the class approval email includes the registration link and escapes rendered values safely.
- [x] 3.2 Update class approval route tests to assert the instructor email is sent with `/onboarding?class=<training_class_id>` using the canonical site URL.
- [x] 3.3 Add or update onboarding registration tests where practical for valid preselection and invalid-link messaging.
- [x] 3.4 Confirm the existing `/api/onboarding/register` and `register_onboarding_student` RPC validation remain the authoritative class eligibility guardrail.

## 4. Verification

- [x] 4.1 Run `npm run test`.
- [x] 4.2 Run `npm run build`.
- [x] 4.3 Manually review generated email HTML/link text for production URL `https://studentportal.winchesterfireems.com/onboarding?class=<training_class_id>`.
