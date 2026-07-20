## MODIFIED Requirements

### Requirement: WFD-branded email template consistency
All student-facing emails SHALL use a consistent WFD-branded HTML template with crimson `#A40104` header background, charcoal `#1C1C1E` bottom border, WFD logo from branding storage, body text in `#4b5563`, footer text in `#6b7280`, and CTA buttons in crimson `#A40104` with no secondary border color. The `from` address SHALL be `students@winchesterfireems.com` for all transactional emails. Brand colors SHALL be centralized in shared constants imported from `src/lib/email.ts`.

#### Scenario: All student emails share the same visual template
- **WHEN** any student-facing transactional email is rendered
- **THEN** it uses the WFD logo header with crimson background, charcoal divider, branded body and footer, and matching CTA button styling
- **AND** all brand colors are sourced from canonical constants

#### Scenario: All emails use the same sender address
- **WHEN** any transactional email is sent
- **THEN** the `from` address is `students@winchesterfireems.com`
- **AND** no email uses `onboarding@winchesterfireems.com` or `noreply@winchesterfireems.com` as a sender

#### Scenario: No rogue colors in email templates
- **WHEN** any email template renders a button
- **THEN** the button uses `#A40104` for background and shadow with no secondary border color

## REMOVED Requirements

### Requirement: Split sender identity by email type
**Reason**: Consolidated to a single sender address (`students@winchesterfireems.com`) to improve sender reputation and simplify contact card instructions for students.
**Migration**: All `from` overrides using `onboarding@winchesterfireems.com` or `noreply@winchesterfireems.com` are replaced with `students@winchesterfireems.com`. The default `from` in `src/lib/email.ts` is updated accordingly.
