## 1. Static assets

- [x] 1.1 Create `/public/contact-card.vcf` with WFD EMS Portal sender identity (FN, ORG, EMAIL fields)

## 2. Email infrastructure — sender consolidation

- [x] 2.1 Update default `from` in `src/lib/email.ts` from `onboarding@winchesterfireems.com` to `students@winchesterfireems.com`
- [x] 2.2 Add contact guidance footer line to `buildEmailHtml()` in `src/lib/email-html.ts` between divider and automated-message text

## 3. API routes — remove from-address overrides

- [x] 3.1 In `src/app/api/schedule/cancel/route.ts`, replace both explicit `from` overrides (lines 91 and 114) with the default (remove the `from` parameter)
- [x] 3.2 In `src/app/api/cron/shift-reminders/route.ts`, replace explicit `from` override (line 113) with the default
- [x] 3.3 In `src/app/api/notify/evaluation-receipt/route.ts`, replace explicit `from` override (line 43) with the default
- [x] 3.4 In `src/app/api/notify/flagged-evaluation/route.ts`, replace explicit `from` override (line 60) with the default
- [x] 3.5 In `src/app/api/admin/schedule-action/route.ts`, replace explicit `from` override (line 116) with the default

## 4. Onboarding complete — deliverability guidance

- [x] 4.1 Add guidance card to `src/components/onboarding/onboarding-complete.tsx` below the credentials box with spam-check instructions and "Download Contact Card" button linking to `/contact-card.vcf`

## 5. Dashboard welcome — deliverability reminder

- [x] 5.1 Add dismissible deliverability notice to the student dashboard welcome area in `src/app/dashboard/page.tsx` with contact-card download link

## 6. Verification

- [x] 6.1 Update `src/lib/email-templates.test.ts` to expect `students@winchesterfireems.com` in any from-address assertions (no changes needed — tests don't assert on from address)
- [x] 6.2 Run `npm run test` to verify all tests pass (101 passed)
- [x] 6.3 Run `npm run build` to verify the build succeeds
