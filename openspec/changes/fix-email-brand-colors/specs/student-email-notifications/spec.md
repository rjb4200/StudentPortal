## MODIFIED Requirements

### Requirement: WFD-branded email template consistency
All student-facing emails SHALL use a consistent WFD-branded HTML template with crimson `#A40104` header background, charcoal `#1C1C1E` bottom border, WFD logo from branding storage, body text in `#4b5563`, footer text in `#6b7280`, and CTA buttons in crimson `#A40104` with no secondary border color. The `from` address SHALL be `onboarding@winchesterfireems.com` for account-related emails and `noreply@winchesterfireems.com` for schedule-related emails. Brand colors SHALL be centralized in shared constants imported from `src/lib/email.ts`.

#### Scenario: All student emails share the same visual template
- **WHEN** any student-facing transactional email is rendered
- **THEN** it uses the WFD logo header with crimson background, charcoal divider, branded body and footer, and matching CTA button styling
- **AND** all brand colors are sourced from canonical constants

#### Scenario: No rogue colors in email templates
- **WHEN** any email template renders a button
- **THEN** the button uses `#A40104` for background and shadow with no secondary border color
