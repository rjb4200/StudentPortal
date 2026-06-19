# email-brand-consistency Specification

## Purpose
Shared email template utility with canonical WFD brand color constants, a reusable `buildEmailHtml()` function, and consistent logo/header across all transactional emails.

## Requirements

### Requirement: Centralized email brand constants
The system SHALL define canonical email brand color constants and a shared `buildEmailHtml()` template function in `src/lib/email.ts`. All email routes SHALL import these constants rather than hardcoding color values. The template function SHALL produce a WFD-branded HTML email with crimson header, logo, charcoal divider, branded body, and CTA button styling.

#### Scenario: Brand colors imported from a single source
- **WHEN** any API route sends a WFD-branded email
- **THEN** it imports `EMAIL_CRIMSON`, `EMAIL_CHARCOAL`, and `EMAIL_LOGO_URL` from `src/lib/email.ts`
- **AND** no route hardcodes a hex color value for branding

#### Scenario: buildEmailHtml shared across all routes
- **WHEN** any transactional email route sends a branded email
- **THEN** it calls the shared `buildEmailHtml()` from `src/lib/email.ts` instead of using its own copy-pasted version
- **AND** this applies to approve-student, onboarding-complete, schedule/cancel, schedule-action, evaluation-receipt, and flagged-evaluation routes

### Requirement: Single brand red in email templates
All WFD-branded email templates SHALL use only `#A40104` (WFD crimson) for header backgrounds, button backgrounds, and button shadows. No secondary red color SHALL appear in any email template.

#### Scenario: Onboarding email uses single crimson
- **WHEN** the onboarding-complete route sends the student credential email
- **THEN** the header background, button background, and button shadow all use `#A40104`
- **AND** the button does not have a `#8a1518` border

#### Scenario: Approval email uses single crimson
- **WHEN** the approve-student route sends the approval email
- **THEN** the button uses `#A40104` for background and shadow with no `#8a1518` border

### Requirement: Evaluation emails have WFD branding
Evaluation receipt and flagged-evaluation emails SHALL include the WFD logo header matching the pattern used by all other transactional emails.

#### Scenario: Evaluation receipt email is branded
- **WHEN** a student submits an evaluation
- **THEN** the receipt email includes the WFD logo header with crimson background and charcoal divider

#### Scenario: Flagged evaluation email is branded
- **WHEN** a low-rating evaluation triggers an admin notification
- **THEN** the notification email includes the WFD logo header with crimson background and charcoal divider

### Requirement: Admin notification emails have WFD branding

Admin-facing notification emails (onboarding complete alerts, student shift cancellation alerts) SHALL use the same WFD-branded HTML template via `buildEmailHtml()` as student-facing emails. These emails SHALL NOT include a CTA button since the admin dashboard URL differs from the student dashboard URL.

#### Scenario: Admin onboarding notification is branded
- **WHEN** a student completes onboarding and the system notifies admins
- **THEN** the admin notification email includes the WFD logo header with crimson background and charcoal divider
- **AND** the email does not include a "View Your Dashboard" CTA button

#### Scenario: Admin shift cancellation notification is branded
- **WHEN** a student cancels their own shift and the system notifies admins
- **THEN** the admin notification email includes the WFD logo header with crimson background and charcoal divider
- **AND** the email does not include a CTA button
