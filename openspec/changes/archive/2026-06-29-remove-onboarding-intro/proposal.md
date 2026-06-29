## Why

The standalone `Wayfinders Onboarding` intro page adds an extra click before students can begin registration. Removing it reduces friction and makes `/onboarding` open directly to the actionable first step while preserving save/resume behavior.

## What Changes

- Remove the standalone onboarding intro screen from the active onboarding flow.
- Show the 5-step onboarding stepper and registration form immediately when no valid saved session exists.
- Keep the saved-session resume prompt as the first screen only when a valid saved session exists.
- Update Start Over behavior to clear the saved session and return directly to step 1 registration instead of the intro screen.
- Remove unused intro-specific page state and component wiring from the onboarding page.

## Capabilities

### New Capabilities

<!-- No new capabilities. -->

### Modified Capabilities

- `onboarding-persistence`: Change fresh-start and start-over behavior so onboarding begins directly at step 1 with the stepper visible, rather than showing an intro hero first.

## Impact

- `src/app/onboarding/page.tsx` — remove `showIntro` state, intro rendering, and Begin Registration callback; make stepper + step 1 the default no-session state.
- `src/components/onboarding/onboarding-intro.tsx` — remove if no longer referenced.
- `openspec/specs/onboarding-persistence/spec.md` — update requirements that currently reference the intro hero and hidden stepper state.
- No API, database, auth, middleware, or Supabase changes.
