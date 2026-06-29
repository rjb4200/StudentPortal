## Why

Instructors enter class dates that directly control when students can register, schedule ride time, and retain portal access, but the registration workflow does not currently explain those consequences. Adding accurate guidance and a class approval notification reduces incorrect class date submissions and gives instructors a clear signal when students can begin registering.

## What Changes

- Add instructor-facing guidance to the class step of `/instructor-registration` explaining that student access depends on the class start date, admin approval, and ride-time end date.
- Add helper text near the class start date field explaining that students cannot register before the class start date.
- Add helper text near the ride-time end date field explaining that student portal access expires after the ride-time period.
- Add an informational warning that portal admin approval is required before students can register.
- Add an instructor approval email sent to the email address on the associated instructor record when a registered class is approved by a portal admin.
- Use the existing WFD EMS email styling shared by other portal emails.
- Update the submission confirmation copy to reinforce that students cannot register until the class is approved and within the active class window, and that the instructor will be emailed when approval occurs.
- Avoid promising backend account archival behavior.
- No changes to existing access-control, scheduling, or expiration behavior.

## Capabilities

### New Capabilities
- `instructor-registration-access-guidance`: Instructor registration guidance and class approval notification behavior explaining how class dates and admin approval affect student registration, scheduling, and portal access.

### Modified Capabilities

## Impact

- Affected UI: `src/app/instructor-registration/page.tsx`
- Affected API: admin registry status approval flow for `training_classes`
- Affected email code: `src/lib/email-templates.ts` and existing email send utility
- Affected route: `/instructor-registration`
- No database, Supabase schema, or access-control changes are expected.
- Verification should include `npm run build` and relevant email/API tests where practical.
