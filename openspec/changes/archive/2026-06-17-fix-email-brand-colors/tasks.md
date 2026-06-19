## 1. Shared Email Template & Brand Constants

- [x] 1.1 Add `EMAIL_LOGO_URL`, `EMAIL_CRIMSON`, `EMAIL_CHARCOAL` constant exports and `buildEmailHtml()` function to `src/lib/email.ts` (ported from the existing copy-pasted version in `schedule/cancel` and `schedule-action`)

## 2. Fix Branded Emails — Single Crimson

- [x] 2.1 Replace `#8a1518` border with removed border in `src/app/api/notify/onboarding-complete/route.ts` — button uses `#A40104` for background and shadow only
- [x] 2.2 Replace `#8a1518` border with removed border in `src/app/api/admin/approve-student/route.ts`
- [x] 2.3 Replace `#8a1518` border with removed border in `src/app/api/schedule/cancel/route.ts`; replace local `buildEmailHtml()` with import from `src/lib/email.ts`
- [x] 2.4 Replace `#8a1518` border with removed border in `src/app/api/admin/schedule-action/route.ts`; replace local `buildEmailHtml()` with import from `src/lib/email.ts`

## 3. Brand Evaluation Emails

- [x] 3.1 Add WFD logo header to `src/app/api/notify/evaluation-receipt/route.ts` using `buildEmailHtml()` from shared utility
- [x] 3.2 Add WFD logo header to `src/app/api/notify/flagged-evaluation/route.ts` using `buildEmailHtml()` from shared utility

## 4. Verification

- [x] 4.1 Run `npm run build` to verify no compilation errors
