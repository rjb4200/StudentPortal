## Why

The onboarding wizard redesign (archived change `2026-06-16-onboarding-wizard-redesign`) created stepper, intro, and save-resume components but never wired them into `page.tsx`. Students navigate 5 onboarding steps with no visual progress indicator, no resume-after-refresh capability, and no branded intro context. The stepper—including its final "Submitted" step—is invisible. Progress is lost on browser refresh because `currentStep` is ephemeral React state. This addresses GitHub issues #36 and #35.

## What Changes

- Wire `OnboardingStepper`, `OnboardingStepperMobile`, `OnboardingIntro`, and `SaveResumeBanner` into the onboarding page orchestrator
- Add `localStorage` persistence (`wfd_onboarding_session`) — save on step advance, load on mount with 24-hour expiry, clear on completion
- Restructure `src/app/onboarding/page.tsx` from a bare `switch` into an orchestrated layout with stepper above all step content
- Restore the "Submitted" final step (step 5) in the visible stepper alongside the `OnboardingComplete` component
- Remove orphaned `handleBack`, `onBack` props wiring from step components since back navigation is managed by the page

## Capabilities

### New Capabilities
- `onboarding-persistence`: Save/resume onboarding progress using `localStorage` with 24-hour session expiry, resume prompt, and clear-on-completion

### Modified Capabilities
<!-- No existing spec requirements change. The stepper fix is purely implementation—the 5-step flow is already specified. -->

## Impact

- `src/app/onboarding/page.tsx` — major restructure: import and render stepper/intro/save-resume components, add localStorage read/write/clear logic
- `src/components/onboarding/onboarding-stepper.tsx` — no changes needed (already complete)
- `src/components/onboarding/onboarding-stepper-mobile.tsx` — no changes needed (already complete)
- `src/components/onboarding/onboarding-intro.tsx` — no changes needed (already complete)
- `src/components/onboarding/save-resume-banner.tsx` — no changes needed (already complete)
- No API changes, no database changes, no middleware changes
