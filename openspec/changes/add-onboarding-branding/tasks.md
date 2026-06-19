## 1. Branded Onboarding Layout

- [x] 1.1 Create `src/app/onboarding/layout.tsx`: full-viewport crimson background with dark radial vignette; centered single-column layout with WFD logo, "WINCHESTER FIRE DEPARTMENT" gold serif tagline, "EMS Student Portal" white serif heading, "Division of EMS" subtitle, tagline text; white content card for `{children}`; charcoal footer with copyright text. Reuse the same `LOGO_URL`, colors, and typography pattern from `(public)/layout.tsx`.

## 2. Onboarding Page Orchestrator

- [x] 2.1 Create `src/app/onboarding/page.tsx`: client component that tracks current step (intro → registration → legal → resources → quiz → complete), renders the corresponding step component with correct props (`studentId`, `onComplete`, `onBack`, `helpEmail`), and lifts `studentId` from registration step

## 3. Verification

- [x] 3.1 Run `npm run build` to verify no compilation errors
- [x] 3.2 Manually verify: visit `/onboarding`, confirm crimson branding with WFD logo appears, step through the flow, confirm footer is visible
