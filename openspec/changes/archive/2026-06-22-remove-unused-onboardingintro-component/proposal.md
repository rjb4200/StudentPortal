## Why

GitHub issue #110 reports that `OnboardingIntro` is a vestigial component from an older onboarding interstitial flow. Keeping unused UI code that contradicts the direct registration flow creates maintenance noise and increases the chance it is accidentally reintroduced.

## What Changes

- Confirm `OnboardingIntro` is not imported or rendered anywhere.
- Delete `src/components/onboarding/onboarding-intro.tsx` if unused.
- Remove stale references that imply the intro interstitial still exists, if any are found.
- Preserve `/onboarding` direct-to-registration behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `branded-public-pages`: Clarify that the direct-to-form onboarding flow must not retain an unused intro interstitial implementation.

## Impact

- Issue: #110, "Remove unused OnboardingIntro component".
- Root cause: the onboarding flow was changed to direct registration, but the old intro component file remained.
- Proposed solution: remove the unused component and verify no imports/references remain.
- Scope: one unused component and any stale references to it.
- Non-goals: redesigning onboarding, changing registration behavior, changing database logic, or altering public page styling.
- Risk assessment: very low; deleting an unreferenced component should not affect runtime behavior.
- Verification plan: search for `OnboardingIntro` and `onboarding-intro`, run `npm run test`, and run `npm run build`.
- Rollback plan: restore the deleted component file if a hidden dependency is discovered during verification.
