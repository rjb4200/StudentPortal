## Context

Student onboarding currently lives at `/onboarding`. The registration form already loads active visible class options from `/api/training-classes/options`, and registration already posts `trainingClassId` to `/api/onboarding/register`. The server route calls the `register_onboarding_student` RPC, which validates that the selected class, training site, and instructor are active and currently visible before assigning `training_class_id`, `training_site_id`, and `instructor_id` to the student row.

Class approval emails already exist in `src/app/api/admin/registry-status/route.ts` when an admin changes a `training_classes` row from a non-active status to `active`. The email template is built by `buildInstructorClassApprovedEmail`.

The production public site is `https://studentportal.winchesterfireems.com/`. The implementation should use the canonical app URL environment value so the generated email link follows production configuration instead of hard-coding an old deployment URL.

## Goals / Non-Goals

**Goals:**

- Include a class-specific student registration link in the instructor's class approval email.
- Use the approved class id as the registration link identifier.
- Preselect the matching class in student onboarding when the link is opened.
- Prevent accidental class changes when a valid class-specific link is used.
- Keep server-side class validity enforcement in the registration path.
- Show a clear student-facing message when a class link cannot be used.

**Non-Goals:**

- Add an admin copy-link button in class management.
- Add instructor dashboard link management.
- Add new database tables or new class-link token records.
- Support classes outside the current public visibility window.
- Change the instructor registration flow that creates pending classes.

## Decisions

### Use `/onboarding?class=<training_class_id>` as the emailed link

The current student registration flow is `/onboarding`, not `/register`. Using `/onboarding?class=<id>` is the smallest compatible change and avoids adding a public route alias before it is needed.

Alternative considered: add `/register?class=<id>` as a friendlier route. This remains possible later as a redirect, but it is not necessary for the instructor approval email use case.

### Generate the email URL from the canonical site URL

The class approval route should construct the registration URL from the configured public site URL and the approved class id. This keeps production links aligned with `https://studentportal.winchesterfireems.com/` and avoids embedding stale Vercel preview URLs in code.

Alternative considered: use `request.nextUrl.origin`. That can reflect internal, preview, or non-canonical hostnames depending on deployment and proxy behavior.

### Let the existing visible-class options endpoint drive frontend preselection

The onboarding form should compare the query class id against the returned class options. If a matching option exists, the form preselects it and locks the dropdown. If no match exists, the form shows a clear invalid/unavailable link message and does not set `training_class_id`.

Alternative considered: add a dedicated public class lookup endpoint. The existing endpoint already returns only visible class options and is sufficient for this scoped feature.

### Keep the registration RPC as the authoritative guardrail

The frontend preselection is only a convenience. The registration API and `register_onboarding_student` RPC must continue to validate the selected class, training site, instructor, and visibility window at submit time. This protects against stale links, manipulated form values, and classes that become unavailable after page load.

Alternative considered: rely on frontend filtering only. That would fail the security requirement because the browser cannot be trusted.

### Lock class selection for valid class-specific links

When the link contains a valid class id, the dropdown should be disabled or otherwise non-editable with explanatory copy. This matches the instructor-delivered link intent and prevents students from accidentally choosing the wrong class.

Alternative considered: allow edits after preselection. That is more flexible but reintroduces the registration error this change is meant to remove.

## Risks / Trade-offs

- Existing saved onboarding sessions may conflict with a class-specific link. Mitigation: implementation should ensure a class-specific link reaches the registration form rather than silently resuming an unrelated saved registration.
- A class may be approved before its start date, while public registration visibility currently begins on `class_start_date`. Mitigation: the email should explain students can use the link when registration is available, and the form should show a clear unavailable message if the link is opened too early.
- An instructor may forward an old link after the class expires or is suspended. Mitigation: options lookup and registration RPC validation both reject unavailable classes.
- Disabled form controls are not submitted by native browser form behavior. Mitigation: registration submission already uses React state, so the selected class id must remain in component state even when the control is locked.

## Migration Plan

No database migration is expected. Deploy the application change with updated tests. Confirm `NEXT_PUBLIC_SITE_URL` is set to `https://studentportal.winchesterfireems.com` or the same URL with a trailing slash trimmed by existing environment handling.

Rollback is application-only: revert the email template/approval route changes and onboarding query handling. Existing class and student data remains compatible.
