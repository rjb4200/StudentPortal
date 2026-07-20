## Why

Emails sent via Resend from `@winchesterfireems.com` are routed to spam by most student email providers. The domain has SPF and DKIM configured but is missing a DMARC policy — a known factor in spam classification. Additionally, students receive no in-app guidance about checking spam or adding the sender to their contacts, and the sender identity is split across two addresses (`onboarding@` and `noreply@`), making it harder to build sender reputation and for students to add a single trusted contact.

## What Changes

- **DNS**: Add `_dmarc.winchesterfireems.com` TXT record with `p=none` monitoring policy (manual DNS change, not in codebase)
- **BREAKING**: Consolidate all email `from` addresses from `onboarding@winchesterfireems.com` and `noreply@winchesterfireems.com` to a single `students@winchesterfireems.com`
- Add a downloadable vCard contact card (`.vcf`) at `/public/contact-card.vcf` with the WFD EMS Portal sender identity
- Add a deliverability guidance notice on the onboarding complete screen (Step 4) with spam-check instructions and a "Download Contact Card" button
- Add deliverability guidance in the student dashboard welcome area with contact card download
- Add a "check spam / add to contacts" hint in the email HTML footer across all transactional emails

## Capabilities

### New Capabilities
- `email-deliverability-guidance`: In-app prompts that guide students to check spam folders and save the WFD EMS Portal sender to their contacts, including a downloadable vCard contact file and footer guidance in all transactional emails.

### Modified Capabilities
- `student-email-notifications`: The `from` address requirement changes from a split identity (`onboarding@` for account emails, `noreply@` for schedule emails) to a single consolidated address: `students@winchesterfireems.com`.

## Impact

- **DNS**: Manual addition of DMARC TXT record for `winchesterfireems.com` (outside codebase, documented as prerequisite)
- **Code**: `src/lib/email.ts` (default from), all API routes that override `from` (7 files), `src/lib/email-html.ts` (footer), `src/components/onboarding/onboarding-complete.tsx`, `src/app/dashboard/page.tsx`
- **Static assets**: New `public/contact-card.vcf`
- **No database changes**: Contact card and guidance messaging are code-level UI changes; no new DB tables or migrations
