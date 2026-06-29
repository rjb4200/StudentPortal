## 1. Remove intro flow from onboarding page

- [x] 1.1 Remove the `OnboardingIntro` import from `src/app/onboarding/page.tsx`
- [x] 1.2 Remove `showIntro` state from `src/app/onboarding/page.tsx`
- [x] 1.3 Remove `handleBegin` from `src/app/onboarding/page.tsx`
- [x] 1.4 Remove the `showIntro` render branch so the no-session default renders the stepper and step 1 registration
- [x] 1.5 Update `handleResume` to restore the saved session without touching intro state
- [x] 1.6 Update `handleStartOver` to clear the saved session and reset to step 1 without returning to an intro screen

## 2. Remove unused intro component

- [x] 2.1 Delete `src/components/onboarding/onboarding-intro.tsx`
- [x] 2.2 Search for `OnboardingIntro`, `showIntro`, and `Begin Registration` references and remove any unused intro-only code

## 3. Verify onboarding behavior

- [x] 3.1 Run `npm run build` and confirm zero errors
- [x] 3.2 Run `npm run test` and confirm all existing tests pass
- [x] 3.3 Manually verify `/onboarding` with no saved session opens directly to step 1 registration with the 5-step stepper visible
- [x] 3.4 Manually verify a valid saved session still shows the resume prompt before step content
- [x] 3.5 Manually verify Resume restores the saved step and displays the stepper
- [x] 3.6 Manually verify Start Over clears `wfd_onboarding_session` and displays step 1 registration with the stepper visible
- [x] 3.7 Manually verify mobile viewport still shows the compact mobile stepper bar on step 1
