## 1. Layout Refinement

- [x] 1.1 Modify `src/app/onboarding/layout.tsx` — change from centered single-column to two-column desktop layout (`lg:flex-row`) matching `/` and `/login` pattern; compact left branding pane; wider right form card (`lg:max-w-xl`); smaller logo (`clamp(130px, 26vw, 280px)`); reduce mobile gap between branding and card (`mb-4`)

## 2. Flow Simplification

- [x] 2.1 Modify `src/app/onboarding/page.tsx` — remove `OnboardingIntro` import and step 0; start `currentStep` at 1; remove `handleBegin` callback; update `handleBack` to `Math.max(1, s - 1)`; remove `onBack` prop from `RegistrationForm`; remove case 0 and default switch branches

## 3. Verification

- [x] 3.1 Run `npm run build` to verify no compilation errors
- [x] 3.2 Manually verify: visit `/onboarding` on desktop — confirm two-column layout with small branding left and wide form right; on mobile — confirm stacked layout with smaller logo and form visible without excessive scrolling; click "Begin Student Onboarding" from landing page — confirm direct transition to registration form with no intro interstitial: visit `/onboarding` on desktop — confirm two-column layout with small branding left and wide form right; on mobile — confirm stacked layout with smaller logo and form visible without excessive scrolling; click "Begin Student Onboarding" from landing page — confirm direct transition to registration form with no intro interstitial
