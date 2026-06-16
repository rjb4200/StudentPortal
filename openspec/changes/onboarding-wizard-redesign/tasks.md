## 1. Design Tokens and Setup

- [x] 1.1 Change `wfd-crimson` from `#B61C20` to `#A40104` (WFD logo red) and add `wfd-sage` (#6A994E) to Tailwind color palette in `tailwind.config.ts`
- [x] 1.2 Add EB Garamond font import to `globals.css` via Google Fonts CDN (weights 400, 700) with `font-display: swap`

## 2. New Onboarding UI Components

- [x] 2.1 Create `src/components/onboarding/onboarding-stepper.tsx` — 5-step horizontal stepper with step circles, labels, descriptions, connector bars, progress bar, and mobile collapse (hidden on screens < 640px)
- [x] 2.2 Create `src/components/onboarding/onboarding-stepper-mobile.tsx` — compact mobile bar showing "Step X of 5", step title, and progress bar (visible only on screens < 640px)
- [x] 2.3 Create `src/components/onboarding/onboarding-intro.tsx` — WFD-branded hero section with department name, welcome message, estimated time, and "Begin Registration" button
- [x] 2.4 Create `src/components/onboarding/save-resume-banner.tsx` — reads `wfd_onboarding_session` from localStorage, shows resume/start-over prompt if valid session exists

## 3. Onboarding Page Rewrite

- [x] 3.1 Rewrite `src/app/onboarding/page.tsx` to orchestrate intro hero, stepper, step cards, and localStorage persistence
- [x] 3.2 Implement localStorage save on every step advancement (key `wfd_onboarding_session` with `studentId`, `currentStep`, `timestamp`, `email`)
- [x] 3.3 Implement localStorage load on mount — check for saved session, determine if intro or resume
- [x] 3.4 Implement localStorage clear on step 5 (completion) and on "Start Over" choice
- [x] 3.5 Implement 24-hour session expiry check on load
- [x] 3.6 Add back navigation support — `onBack` callback for steps 2–4, managed by page orchestrator

## 4. Step Component Enhancements

- [x] 4.1 Update `registration-form.tsx` — add WFD title underline (`border-b-2 border-wfd-crimson pb-2`), help footer, accept optional `onBack` prop (unused for step 1)
- [x] 4.2 Update `legal-waiver.tsx` — add WFD title underline, help footer, back navigation button (secondary variant), accept `onBack` prop
- [x] 4.3 Update `resource-library.tsx` — add WFD title underline, help footer, back navigation button, accept `onBack` prop
- [x] 4.4 Update `knowledge-gate.tsx` — add WFD title underline, help footer, back navigation button, accept `onBack` prop
- [x] 4.5 Update `onboarding-complete.tsx` — add WFD title underline, ensure no back button, accept `onBack` prop (unused for step 5)

## 5. Mobile Adaptation

- [x] 5.1 Ensure stepper desktop variant is hidden below 640px via `hidden sm:block`
- [x] 5.2 Ensure stepper mobile variant is visible below 640px via `block sm:hidden`
- [x] 5.3 Test step card padding/width at mobile viewports — ensure form fields, legal docs, and quiz photos are usable at 375px width
- [x] 5.4 Ensure intro hero text fits on mobile without overflow

## 6. Cleanup

- [x] 6.1 Delete `src/components/onboarding/mcq-section.tsx`
- [x] 6.2 Delete `src/components/onboarding/image-grid-quiz.tsx`
- [x] 6.3 Delete `src/components/onboarding/hotspot-quiz.tsx`
- [x] 6.4 Verify no remaining imports reference the deleted files

## 7. Verification

- [x] 7.1 Run `npm run build` and confirm zero errors
- [x] 7.2 Manually verify: fresh onboarding flow shows intro hero → 5-step stepper
- [x] 7.3 Manually verify: closing browser mid-onboarding and reopening shows resume prompt
- [x] 7.4 Manually verify: "Start Over" clears localStorage and returns to intro
- [x] 7.5 Manually verify: completing all steps shows 100% progress and clears session
- [x] 7.6 Manually verify: mobile viewport shows compact stepper bar instead of 5 circles
- [x] 7.7 Manually verify: back navigation works on steps 2, 3, 4
