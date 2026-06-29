## Context

The `/instructor-registration` page is a three-step client-side form. Step 3 collects the class name, beginning-of-class date, end-of-ride-time date, and optional notes before submitting a pending `training_classes` record for admin review.

Current enforcement already depends on these dates: students only see active classes when today's date is within the class window, schedule requests are rejected outside the class window, and student access expiration is derived from the ride-time end date at approval. The instructor-facing form does not explain those consequences at the point where instructors enter the dates, and instructors do not currently receive a clear automated notification when a registered class is approved.

## Goals / Non-Goals

**Goals:**
- Add clear, accurate explanatory copy to Step 3 of `/instructor-registration`.
- Explain that student registration depends on both class start date and portal admin approval.
- Explain that students may only schedule/ride during the active ride-time window.
- Explain that student portal access expires after the ride-time end date.
- Reinforce date accuracy before submission and on successful submission.
- Send an approval notification email to the associated instructor email address when a portal admin approves a registered class.
- Use the existing WFD EMS email shell and visual styling used by other portal emails.

**Non-Goals:**
- Do not change class approval, student onboarding, scheduling, expiration, or cron behavior.
- Do not state that accounts are archived after ride time ends, since current code marks expired access as `expired`.
- Do not introduce new database columns, migrations, API behavior, or shared UI component APIs unless the implementation later shows that is necessary.

## Decisions

- Place the main guidance in Step 3 instead of earlier steps.
  - Rationale: Step 3 is where instructors enter the class start and ride-time end dates, so the warning is closest to the decision it affects.
  - Alternative considered: Add copy to the page intro. This is less targeted and easier to miss before date entry.

- Use local helper text around the two date inputs instead of changing the shared `Input` component.
  - Rationale: The issue is copy-only and scoped to one form. Changing the shared input API would increase surface area without reuse pressure.
  - Alternative considered: Add a `helperText` prop to `Input`. This may be useful later, but it is unnecessary for this isolated guidance.

- Send the approval email from the admin registry status approval path for `training_classes`.
  - Rationale: The class becomes visible to students when its status is changed to `active`; the notification should be tied to that transition.
  - Alternative considered: Send the email during instructor registration submission. That would notify too early, before portal admin approval.

- Send the approval email to the associated instructor record's email address.
  - Rationale: Instructor registration stores the instructor-provided email on the `instructors` record and training classes reference instructors by `instructor_id`.
  - Alternative considered: Store a separate class registration contact email. That would require schema changes and duplicate existing instructor contact data.

- Build the new approval email with `buildEmailHtml` through `src/lib/email-templates.ts`.
  - Rationale: Existing student approval, onboarding, and shift emails share the WFD EMS branded wrapper from `src/lib/email-html.ts`; using the same helper keeps styling consistent.
  - Alternative considered: Inline a one-off email body inside the API route. That would duplicate styling and make future email changes harder.

- Do not let approval notification delivery failure block class approval.
  - Rationale: Admin approval is the source of truth for access. A transient email provider failure should not leave the class pending after the admin approved it.
  - Alternative considered: Fail the approval request when email delivery fails. That would make registry approval dependent on Resend availability.

- Use accurate product wording for expiration and approval.
  - Rationale: The UI can now promise an instructor approval email because this change adds that behavior, but it still should not state that student accounts are archived after ride time because current code marks expired access as `expired`.
  - Alternative considered: Use the suggested copy verbatim. That would still risk misleading instructors about archival behavior.

## Risks / Trade-offs

- More copy in Step 3 could make the form feel heavier. Mitigation: Use concise helper text and one compact informational callout.
- Approval email delivery could fail after a class is approved. Mitigation: Log the failure and keep approval successful so access state remains correct.
- Re-approving an already active class could send duplicate emails if the API does not guard for status transitions. Mitigation: Send the email only when the target table is `training_classes`, the requested status is `active`, and the existing status was not already `active`.
- Saying access "expires" is accurate to current code but less plain-language than "archived." Mitigation: Pair it with the concrete user impact: students can no longer log in or schedule after the ride-time end date.
