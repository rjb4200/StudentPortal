## Context

The app sends transactional emails through Resend from `@winchesterfireems.com`. Two sender identities are used: `onboarding@` (default, for account/admin emails) and `noreply@` (for schedule/transactional emails). The domain has SPF and DKIM verified via Resend but no DMARC policy — a significant deliverability factor. Emails consistently land in spam for student recipients (Gmail, Outlook, Yahoo, iCloud, school .edu addresses).

Students currently receive zero guidance about checking spam or adding the sender to their contacts. The onboarding complete screen does show credentials on-screen, but students are never told to check spam for future emails (approval, shift reminders, messages).

## Goals / Non-Goals

**Goals:**
- Consolidate all email sending to a single `from` address: `students@winchesterfireems.com`
- Provide students with a one-click way to save the sender to their contacts (vCard `.vcf`)
- Add in-app prompts at key touchpoints telling students to check spam and add to contacts
- Add a deliverability hint in the email HTML footer
- Document the DMARC DNS record needed (manual DNS change, outside codebase)

**Non-Goals:**
- Changing email content or template structure beyond the footer
- Resend domain/API key changes
- Sending email from a different domain
- SMS or push notification fallbacks
- Dashboard notification center changes

## Decisions

### Decision 1: vCard (.vcf) for contact card

**Chosen:** Static `.vcf` file served from `/public/contact-card.vcf`.

**Alternatives considered:**
- Dynamically generated `.vcf` via API route — unnecessary; the sender identity is static
- `mailto:` link with `?body=` — doesn't actually create a contact, just opens compose window
- QR code — adds friction, students may not know how to scan

**Rationale:** `.vcf` is universally supported by all email clients and OSes (iOS, Android, Windows, macOS). One click downloads, one click opens the contact card, and the email client auto-adds it. Static file is zero server cost.

### Decision 2: Placement of deliverability notices

**Chosen:** Onboarding Complete screen (Step 4) + Student Dashboard welcome area + email HTML footer.

**Alternatives considered:**
- Login page only — too late; students need the habit built early
- Every onboarding step — would be intrusive
- Popup/toast — dismissible patterns encourage ignoring

**Rationale:** The onboarding complete screen is seen by every student at the moment credentials are displayed — the highest-attention moment. Dashboard welcome reinforces the habit post-login. Email footer catches any student who actually opens an email. Three touchpoints covering the full lifecycle.

### Decision 3: Component architecture

**Chosen:** Inline additions to `OnboardingComplete` and the dashboard page rather than a shared component.

**Alternatives considered:**
- `EmailDeliverabilityNotice` shared component — premature; the two placements have different context and visual treatment (onboarding is a card in the flow, dashboard is a dismissible banner)
- Portal setting for notice content — adds unnecessary admin configuration complexity

**Rationale:** The messaging is static and specific to each context. A reusable component can be extracted later if a third placement emerges.

### Decision 4: Email footer content

**Chosen:** Add a single line between the existing divider and the "This is an automated message" text in `buildEmailHtml()`.

**Rationale:** Minimal change to the existing template, non-intrusive, consistent across all emails.

## Risks / Trade-offs

- **[Risk] Changing from address may temporarily reduce sender reputation** → Mitigation: The new `students@` address is on the same verified domain with SPF and DKIM. Reputation is domain-based more than local-part-based. Gradual warm-up not needed for same-domain address change.
- **[Risk] .vcf download may not work on all mobile browsers** → Mitigation: Fallback text always shows the email address as plain text alongside the download button.
- **[Risk] Students may ignore the notice** → Mitigation: Short, scannable text with a clear action item (download button). Not a guaranteed fix, but removes the "I had no idea" failure mode.

## Open Questions

- Should `students@winchesterfireems.com` be an actual mailbox that receives replies, or remain as a send-only address? (Currently `onboarding@` and `noreply@` are unmonitored.)
