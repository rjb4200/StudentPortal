## Why

Twilio A2P/10DLC campaign registration requires valid, direct URLs for Privacy Policy and Terms & Conditions pages. Without these, the SMS notification feature cannot complete campaign registration.

## What Changes

- Create public `/privacy-policy` page with SMS-specific data usage language
- Create public `/terms-and-conditions` page with SMS program terms (HELP, STOP, frequency, rates)
- Add links to both pages from the public footer
- Both pages are accessible without authentication using existing WFD-branded public page styling

## Capabilities

### New Capabilities
- `sms-compliance-policy-pages`: Public Privacy Policy and Terms & Conditions pages meeting Twilio A2P requirements, linked from the application footer

### Modified Capabilities
- `branded-public-pages`: Add `/privacy-policy` and `/terms-and-conditions` to the list of public routes that render with the crimson hero layout and footer

## Impact

- New routes in Next.js App Router: `app/(public)/privacy-policy/page.tsx`, `app/(public)/terms-and-conditions/page.tsx`
- Update public layout/footer component to include policy links
- No database changes, no API changes, no dependency changes
