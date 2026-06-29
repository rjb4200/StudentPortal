## Why

Class instructors need a reliable class-specific registration link after their class is approved so they can send students directly into the correct onboarding path. This reduces student registration errors by avoiding manual class selection and ensures each student is associated with the approved class, training site, and instructor.

## What Changes

- Add a class-specific student registration URL for approved classes, using the production site `https://studentportal.winchesterfireems.com/` as the public base URL.
- Include the class-specific registration link in the existing class approval email sent to the instructor when an admin approves a class.
- When a student opens the class-specific registration link, preselect the matching training site/class option during onboarding.
- Prefer locking the preselected class option so students do not accidentally register under a different class from the instructor-provided link.
- Show a clear message if the provided class link is invalid, unavailable, not yet visible, expired, suspended, archived, rejected, or otherwise not eligible for public registration.
- Continue enforcing class validity server-side during registration so tampered or stale links cannot attach students to unavailable classes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `student-onboarding`: Support class-specific onboarding links that preselect and lock a valid class during student registration.
- `student-email-notifications`: Include the class-specific student registration link in the instructor class approval email.

## Impact

- Affected UI: `src/app/onboarding/page.tsx`, `src/components/onboarding/registration-form.tsx`.
- Affected email flow: `src/app/api/admin/registry-status/route.ts`, `src/lib/email-templates.ts`.
- Affected validation/security: existing `/api/training-classes/options` lookup and `/api/onboarding/register` RPC-backed server validation.
- Affected tests: email template tests and class approval email route tests; add or update onboarding/class-link tests where practical.
- No new third-party dependencies are expected.
