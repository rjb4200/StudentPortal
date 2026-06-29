## 1. Instructor Registration Copy

- [x] 1.1 Add a compact informational callout to Step 3 of `src/app/instructor-registration/page.tsx` explaining that student access depends on class start date, portal admin approval, and ride-time end date.
- [x] 1.2 Add helper text near the beginning-of-class date field explaining that students cannot register before that date and still require portal admin approval.
- [x] 1.3 Add helper text near the end-of-ride-time date field explaining that students may only schedule/ride during the ride-time period and portal access expires after that date.
- [x] 1.4 Update the successful submission confirmation to explain that the class is pending admin review, students cannot register until approval and the class start date, and the instructor will receive an email when the class is approved.

## 2. Instructor Approval Email

- [x] 2.1 Add a WFD EMS styled instructor class approval email builder in `src/lib/email-templates.ts` using the existing `buildEmailHtml` wrapper.
- [x] 2.2 Update the admin registry status approval flow to detect `training_classes` transitions from non-active to `active`.
- [x] 2.3 Send the approval email to the associated instructor record's email address with class name, class start date, ride-time end date, and training site name when available.
- [x] 2.4 Ensure email delivery failure is logged but does not block successful class approval.
- [x] 2.5 Ensure approving an already active class does not send a duplicate approval email.

## 3. Verification

- [x] 3.1 Verify the copy promises the approval email but does not promise account archival behavior.
- [x] 3.2 Add or update relevant tests for the email template and approval email trigger where practical.
- [x] 3.3 Run `npm run test`.
- [x] 3.4 Run `npm run build`.
