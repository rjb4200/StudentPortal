## 1. Restructure page.tsx rendering

- [x] 1.1 Import `OnboardingStepper`, `OnboardingStepperMobile`, `OnboardingIntro`, and `SaveResumeBanner` in `src/app/onboarding/page.tsx`
- [x] 1.2 Add `showIntro` state (default `true`) to control intro hero visibility
- [x] 1.3 Restructure the `switch` from direct `return` to a variable assignment (`stepContent`) so the stepper can wrap around all steps
- [x] 1.4 Render `OnboardingIntro` when `showIntro` is true, passing `onBegin` that sets `showIntro = false`
- [x] 1.5 Render `OnboardingStepper` and `OnboardingStepperMobile` above step content when `showIntro` is false, passing `currentStep`

## 2. Add localStorage persistence

- [x] 2.1 Define a `WfdOnboardingSession` TypeScript interface and a `SAVE_KEY = 'wfd_onboarding_session'` constant
- [x] 2.2 Add a `saveSession` helper that writes `studentId`, `currentStep`, `email`, and `timestamp` to localStorage
- [x] 2.3 Add a `loadSession` helper that reads the key, checks 24-hour staleness, and returns the parsed session or removes the expired key
- [x] 2.4 Add a `clearSession` helper that removes the key from localStorage
- [x] 2.5 Call `saveSession` in `handleRegistrationComplete` after setting step 2
- [x] 2.6 Call `saveSession` in `handleLegalComplete` after setting step 3
- [x] 2.7 Call `saveSession` in `handleResourcesComplete` after setting step 4
- [x] 2.8 Call `clearSession` in `handleQuizComplete` when advancing to step 5

## 3. Wire save-resume on mount

- [x] 3.1 Add a `useEffect` on mount that calls `loadSession` to check for a saved session
- [x] 3.2 Add `showResumeBanner` state — set to `true` when a valid saved session exists
- [x] 3.3 Render `SaveResumeBanner` when `showResumeBanner` is true, passing `onResume` and `onStartOver` callbacks
- [x] 3.4 Implement `onResume`: restore `currentStep`, `studentId`, and email from saved session; hide intro and resume banner
- [x] 3.5 Implement `onStartOver`: call `clearSession`, hide resume banner, show intro hero

## 4. Verify

- [x] 4.1 Run `npm run build` and confirm zero errors
- [x] 4.2 Run `npm run test` and confirm all existing tests pass
- [x] 4.3 Manually verify: fresh onboarding shows intro hero, then 5-step stepper after clicking Begin Registration
- [x] 4.4 Manually verify: all 5 steps appear in the stepper, including "Submitted" as step 5 with 100% progress
- [x] 4.5 Manually verify: refreshing the browser mid-onboarding shows the resume banner and correctly restores the saved step
- [x] 4.6 Manually verify: "Start Over" clears localStorage and returns to intro hero
- [x] 4.7 Manually verify: completing all steps (reaching step 5) clears the session from localStorage
- [x] 4.8 Manually verify: mobile viewport shows compact stepper bar instead of 5 circles
