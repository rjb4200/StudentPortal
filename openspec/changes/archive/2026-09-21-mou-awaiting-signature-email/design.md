## Context

The MOU workflow has two phases: instructor signature (during class registration via `instructor/register/route.ts`) and WFEMS admin signature (via `admin/sign-mou/route.ts`). Currently, email notifications only fire on phase 2 -- when the admin signs and generates the completed PDF. The instructor's signature in phase 1 silently creates the `class_mous` row and waits for admin attention.

The gap: admins aren't proactively notified that their signature is needed. They must discover unsigned MOUs by checking the Daily Ops dashboard.

## Goals / Non-Goals

**Goals:**
- Send a branded email to opted-in admins immediately after an instructor signs an MOU during registration
- Reuse the existing `admin_accounts.notify_class_mou` toggle for opt-in (no new DB columns)
- Follow the established pattern: template in `email-templates.ts`, send in the API route, use `sendEmail()` from `email.ts`

**Non-Goals:**
- Reminder cadence (cron-based follow-ups for unsigned MOUs older than N days)
- Changing the instructor registration flow or data model
- Changing the existing completed-MOU email behavior (sign-mou route)

## Decisions

### Decision 1: Trigger point is `instructor/register/route.ts` POST, after MOU insert

The MOU row is inserted at line 196 of the route. The email should fire after the insert succeeds. If the insert fails, no email is sent (the existing `mouError` check handles this).

**Alternative considered**: Use a database trigger. Rejected because email sending depends on Resend API availability, which should happen in application code (with graceful degradation), not inside a transaction.

### Decision 2: Reuse `notify_class_mou` for both "awaiting" and "completed" MOU emails

The existing toggle was documented as "completed class MOU PDF emails." We broaden its semantics to include the "awaiting signature" notification. Admins who want MOU emails get both; those who don't get neither. Keeps configuration simple -- one toggle, not two.

**Alternative considered**: Add a separate `notify_class_mou_pending` toggle. Rejected as over-engineered for a single notification type.

### Decision 3: Email template includes a direct link, not just a notice

The email body includes the class name, training site, instructor name, and a link to the admin portal. The link points to the Daily Ops page (which already lists unsigned MOUs in its action queue) rather than a specific class detail page, since the admin needs to see the full MOU before signing.

## Risks / Trade-offs

- **Email sent before admin can act on class approval**: The instructor registration creates both a `training_classes` row (status: pending) and the MOU row in one request. If the admin later rejects the class, the "awaiting signature" email becomes moot. This is acceptable -- the same pattern already exists for onboarding-complete admin notifications.
- **Duplicate emails if instructor resubmits**: The `class_mous` table has a UNIQUE constraint on `training_class_id`. If an instructor somehow triggers a second registration for the same class, the MOU insert would fail on the constraint, and no email would be sent. Safe.
