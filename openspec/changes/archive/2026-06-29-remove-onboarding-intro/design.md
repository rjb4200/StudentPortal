## Context

The onboarding page currently has three top-level render states: saved-session resume prompt, standalone intro hero, and the stepper-wrapped onboarding steps. The intro hero was added to provide branded context before registration, but it creates a non-essential click before the student reaches the registration form.

The current `onboarding-persistence` spec also encodes the intro as required behavior: fresh visitors see the intro, the stepper is hidden during the intro phase, and Start Over returns to the intro. Removing the intro requires both code cleanup and spec updates.

## Goals / Non-Goals

**Goals:**

- Make `/onboarding` open directly to step 1 registration when no valid saved session exists.
- Keep the resume prompt as the only pre-step interruption, shown only when a valid saved session exists.
- Keep the desktop and mobile 5-step stepper visible for steps 1 through 5.
- Make Start Over clear the saved session and return directly to step 1 registration.
- Remove unused intro component and intro-specific state from the onboarding page.

**Non-Goals:**

- No changes to registration, legal, resources, quiz, or completion business logic.
- No changes to localStorage schema, TTL, or save/clear trigger points.
- No database, API, auth, middleware, or Supabase changes.
- No replacement landing page or alternate marketing page for onboarding.

## Decisions

### Decision 1: Remove the intro render state entirely

The onboarding page should no longer track `showIntro` or render `OnboardingIntro`. The no-session default state is step 1 with the stepper visible.

Alternative considered: keep a smaller intro panel above registration. Rejected for this change because the user explicitly prefers removing the intro entirely, and a panel would still add non-essential visual weight.

### Decision 2: Preserve the resume prompt as the only pre-step state

The page should still check `wfd_onboarding_session` on mount. If a valid saved session exists, show `SaveResumeBanner`; otherwise show step 1 directly.

Alternative considered: always show step 1 and render the resume prompt inline. Rejected because the current banner already creates a clear choice and avoids accidentally starting over when a valid session exists.

### Decision 3: Start Over returns to step 1, not a splash screen

`onStartOver` should clear localStorage, reset onboarding state, hide the resume banner, and leave the page at step 1 registration with the stepper visible.

Alternative considered: redirect or reload `/onboarding`. Rejected because resetting client state is simpler and avoids unnecessary navigation.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Students lose the brief "what to expect" explanation | The stepper labels still communicate the 5-step path; future copy can be added inside registration if needed as a separate change. |
| Existing spec still references intro behavior | This change includes a delta spec modifying the affected requirements. |
| Orphaned `OnboardingIntro` import or file causes unused code | Implementation tasks explicitly remove the import, state, callback, render branch, and component file. |
| Resume flow accidentally shows stepper before the student chooses Resume or Start Over | Keep `showResumeBanner` as the first render branch when a valid saved session exists. |
