## Context

Six API route files construct transactional email HTML by interpolating student data (name, email, school) directly into JS template literals. There is no HTML escaping at any of the 15+ interpolation points. Two routes (`approve-student`, `onboarding-complete`) duplicate the same 264-line WFD branded layout instead of calling the shared `buildEmailHtml()` in `src/lib/email.ts`. Three admin notification emails use bare `<p>` tags with no branding at all.

The `sendEmail()` function and `buildEmailHtml()` already exist in `src/lib/email.ts` as centralized utilities, but routes bypass them or use them inconsistently.

The `message_templates` database table stores welcome/completion messages for in-app display only and is not involved in transactional email rendering.

## Goals / Non-Goals

**Goals:**
- Eliminate HTML injection risk by escaping every user-provided value before it enters email HTML
- Eliminate the 264-line copy-pasted WFD layout by making all routes use `buildEmailHtml()`
- Centralize all email template definitions in one typed module so adding or changing an email is a single-file operation
- Give every transactional email consistent WFD branding (crimson header, logo, charcoal divider, footer)
- Preserve existing email subjects, recipient logic, and visual appearance — only the construction mechanism changes

**Non-Goals:**
- Input validation on onboarding forms (separate concern)
- Database constraints on student fields (separate concern)
- Improving error handling in routes (empty `catch {}` blocks)
- Making transactional email templates admin-editable via database
- Changing the `message_templates` table or its in-app display role

## Decisions

### Decision 1: Templates in code, not database

**Chosen**: Define all 10 transactional email templates as typed functions in a new `src/lib/email-templates.ts`.

**Alternatives considered**:
- *Extend `message_templates` table with interpolation syntax (e.g., `{{full_name}}`)*: Would require a migration, variable-parsing engine, fallback handling for missing/edited templates, and an admin UI update. Admin-editable transactional email templates introduce risk of broken rendering with no clear benefit — how often does an admin need to change the wording of an approval email? Rejected because the complexity-to-value ratio is too high.
- *Keep templates inline but add `escHtml()` calls at each interpolation point*: Would fix the security issue but leave all the duplication in place. Rejected as insufficient for a deep fix.

**Rationale**: Code-based templates are type-safe, version-controlled alongside application code, and require zero infrastructure changes. The `escHtml()` call lives inside the template function, not the route — making it impossible for a new route to forget escaping.

### Decision 2: One function per email type (not a registry object)

**Chosen**: 10 individually exported functions (`buildStudentApprovalEmail`, `buildOnboardingCompleteStudentEmail`, etc.), each with its own typed parameter interface.

**Alternatives considered**:
- *Single `renderEmail(templateKey, vars)` function with a discriminated union*: More centralized but the TypeScript discriminated union would be large and harder to read. Individual functions are self-documenting and simple to import.
- *Registry object mapping keys to template definitions*: Similar to discriminated union but less type-safe.

**Rationale**: Individual functions give the cleanest call site (`buildStudentApprovalEmail({ full_name, login_url })`) with full autocomplete and type checking. Adding a new email type means adding one new function — no need to update a central type definition or registry.

### Decision 3: `escHtml()` as a standalone utility

**Chosen**: A pure function `escHtml(value: string): string` in `src/lib/email.ts` that escapes `&`, `<`, `>`, `"`, `'`.

**Alternatives considered**:
- *Use a library like `lodash.escape`*: Adds a dependency for a 5-line function. Rejected.
- *Use `he` library*: Robust but overkill for email-safe HTML. Rejected.

**Rationale**: The standard 5-character escape set (`&`, `<`, `>`, `"`, `'`) is sufficient for HTML email. Email clients strip `<script>` tags and JavaScript, so the primary concern is markup corruption (broken DOM, misrendered text), not XSS. A hand-rolled function avoids a dependency and is trivially testable.

### Decision 4: Add `ctaText` parameter to `buildEmailHtml()`

**Chosen**: Add an optional 4th parameter `ctaText?: string` defaulting to `"View Your Dashboard"`.

**Alternatives considered**:
- *Make CTA button part of `bodyHtml` and never pass `loginUrl` to `buildEmailHtml()`*: Would require template functions to duplicate the CTA button HTML (same styling, same structure). Rejected because it creates a new form of duplication.
- *Create a separate `buildEmailHtmlWithCustomCta()` function*: Unnecessary proliferation of similar functions. Rejected.

**Rationale**: A single optional parameter is the smallest change that solves the problem. Approval and onboarding-complete emails need "Go to Student Portal Login" text; schedule emails use the default "View Your Dashboard". The `ctaText` parameter is escaped inside `buildEmailHtml()`.

### Decision 5: All admin notification emails get branding

**Chosen**: Admin-facing emails (`buildOnboardingCompleteAdminEmail`, `buildShiftCancelledByStudentAdminEmail`, `buildFlaggedEvaluationEmail`) all use `buildEmailHtml()`.

**Rationale**: Currently these send bare `<p>` tags. The `email-brand-consistency` spec already mandates WFD branding for all transactional emails. The existing implementation was incomplete — this design fixes that gap. Admin emails use `buildEmailHtml()` without a `loginUrl` (no CTA button, since the admin dashboard URL is different).

## Template Function Inventory

| # | Function | Source Route | Recipient | Escaped Vars |
|---|---|---|---|---|
| 1 | `buildStudentApprovalEmail` | approve-student | Student | `full_name`, `login_url` |
| 2 | `buildOnboardingCompleteStudentEmail` | onboarding-complete | Student | `email`, `login_url` |
| 3 | `buildOnboardingCompleteAdminEmail` | onboarding-complete | Admins | `full_name`, `email`, `school_name` |
| 4 | `buildShiftCancelledByStudentEmail` | schedule/cancel | Student | `full_name`, `date_str`, `time_display`, `note` |
| 5 | `buildShiftCancelledByStudentAdminEmail` | schedule/cancel | Admins | `full_name`, `date_str`, `time_display`, `note` |
| 6 | `buildShiftApprovedEmail` | schedule-action | Student | `full_name`, `date_str`, `time_display` |
| 7 | `buildShiftCancelledByAdminEmail` | schedule-action | Student | `full_name`, `date_str`, `time_display`, `note` |
| 8 | `buildShiftRejectedEmail` | schedule-action | Student | `full_name`, `date_str`, `time_display` |
| 9 | `buildEvaluationReceiptEmail` | evaluation-receipt | Student | `full_name` |
| 10 | `buildFlaggedEvaluationEmail` | flagged-evaluation | Admins | `student_name`, `preceptor_name`, `overall_rating` |

Each function returns `{ subject: string; html: string }`. Routes unpack this and pass to `sendEmail()`.

## Risks / Trade-offs

- **Template functions contain HTML strings**: HTML is still written inside TypeScript template literals, which means no compile-time HTML validation. This is the same risk as the current code — the improvement is that HTML is centralized (one file to audit) and all variables are escaped. Mitigation: the unit tests verify rendered output for each template.
- **`tempPassword` is not escaped**: The system-generated temporary password is a 6-digit numeric string and is safe. This is documented as an intentional exclusion.
- **`date_str` and `time_display` are escaped despite being system-generated**: Defense in depth. These values come from database fields (`date`, `start_time`, `end_time`, `shift_type`). While they're constrained by schema (date column, time strings, enum), escaping them costs nothing and protects against unexpected values.
- **No runtime template reloading**: Since templates are in code, changing an email requires a deployment. This is acceptable — transactional email wording changes are code changes and should go through the normal deploy pipeline.

## Open Questions

None — all design decisions are resolved.
