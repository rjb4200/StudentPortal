## Context

The onboarding page (`src/app/onboarding/page.tsx`) currently uses a bare `switch` statement keyed on `useState(currentStep)` to render step content. Four components exist but are not imported:

```
src/components/onboarding/
  onboarding-stepper.tsx        ← 5-step horizontal stepper (desktop)
  onboarding-stepper-mobile.tsx ← compact mobile bar
  onboarding-intro.tsx          ← branded hero with "Begin Registration"
  save-resume-banner.tsx        ← reads localStorage, shows resume prompt
```

All four were built during the archived wizard redesign. The page rewrite that would have wired them together was marked complete but never executed. The page also has no persistence — `currentStep` is ephemeral React state lost on browser refresh.

**Constraints:**
- No database migrations, no API changes, no middleware changes
- Existing step components (RegistrationForm, LegalWaiver, ResourceLibrary, KnowledgeGate, OnboardingComplete) keep their props contracts
- Purely client-side persistence via `localStorage`

## Goals / Non-Goals

**Goals:**
- Wire `OnboardingStepper` and `OnboardingStepperMobile` into the page so students see all 5 steps including "Submitted"
- Wire `OnboardingIntro` as a one-time hero shown before step 1
- Wire `SaveResumeBanner` to allow resuming after browser close/refresh
- Add `localStorage` persistence: save on step advance, load on mount (24h expiry), clear on completion (step 5) and "Start Over"
- Restructure `page.tsx` from a flat switch into an orchestrated layout

**Non-Goals:**
- No changes to individual step components (they keep existing props)
- No database-backed session persistence (localStorage only)
- No cross-device sync
- No changes to the `/api/notify/onboarding-complete` endpoint
- No changes to quiz logic, legal signing, or registration RPC

## Decisions

### Decision 1: Page restructure from switch to wrapper

**Current state:**
```
switch (currentStep) {
  case 1: return <RegistrationForm ... />;
  case 2: return <LegalWaiver ... />;
  ...
}
```

**Target state:**
```
<>
  {showIntro ? <OnboardingIntro ... /> : (
    <>
      <OnboardingStepper currentStep={currentStep} />
      <OnboardingStepperMobile currentStep={currentStep} />
      {stepContent}
    </>
  )}
  {showResume ? <SaveResumeBanner ... /> : null}
</>
```

**Rationale:** The `switch` remains for selecting step content, but it returns JSX (not a direct `return`) so the stepper renders above all steps. The intro hero is exclusive — shown only before the stepper. This avoids a complete rewrite while adding stepper visibility.

**Alternative considered:** Route-based steps (`/onboarding/register`, `/onboarding/legal`, etc.). Rejected because it overcomplicates a working single-page flow and would require middleware to guard step ordering.

### Decision 2: localStorage schema (unchanged from archived design)

**Choice:** Single JSON key `wfd_onboarding_session`:

```json
{
  "studentId": "uuid | null",
  "currentStep": 1,
  "timestamp": "ISO-8601",
  "email": "string"
}
```

24-hour staleness check. Key is removed on step 5 (completion) or explicit "Start Over."

**Rationale:** Already specified in the archived `onboarding-persistence` spec. Single key avoids namespace pollution. 24-hour TTL prevents showing a resume prompt for week-old abandoned sessions.

### Decision 3: Save trigger points

**Choice:** Save on every step advancement (in the existing callbacks: `handleRegistrationComplete`, `handleLegalComplete`, `handleResourcesComplete`, `handleQuizComplete`). Load once on mount via `useEffect`.

```
handleRegistrationComplete → setCurrentStep(2) + saveToLocalStorage(2, studentId, email)
handleQuizComplete        → setCurrentStep(5) + clearLocalStorage()
```

**Rationale:** Triggers are already well-defined. Adding a `saveSession` helper called alongside the existing state update is minimal. A separate `useEffect` watching `currentStep` would save redundantly on mount.

### Decision 4: Intro hero state flow

**Choice:** `showIntro` state starts `true` unless a valid saved session exists. On "Begin Registration" click, set `showIntro = false` and advance to step 1 with stepper visible.

```
[Intro Hero] ──"Begin Registration"──▶ [Stepper + Step 1 Content]
```

**Rationale:** The intro is a one-time splash. Once dismissed, it never returns during that session. If a session is resumed, the intro is skipped entirely.

### Decision 5: SaveResumeBanner integration

**Choice:** On mount, check for `wfd_onboarding_session` in localStorage. If valid (exists + <24h old), render `SaveResumeBanner` instead of `OnboardingIntro`. On "Resume," restore step/studentId/email and show stepper at saved step. On "Start Over," clear key and show intro.

**Rationale:** The `SaveResumeBanner` component already handles its own UI and callbacks. The page only needs to wire the `onResume` and `onStartOver` props.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| localStorage cleared by browser settings / private mode | No data loss — student starts from step 1 with intro hero. Registration RPC handles duplicate detection on re-submit. |
| Student opens onboarding in two tabs | Last-write-wins for localStorage. Acceptable — edge case is rare and no critical data is lost. |
| Restored `studentId` references an already-deleted or completed record | The step components handle this gracefully via their own data-fetching logic (e.g., LegalWaiver fetches active documents for the studentId). |
| `save-resume-banner.tsx` reads localStorage but the page also reads it on mount — potential double-read | Single source: the page reads on mount and passes data down via props. The banner is purely presentational (receives callbacks, not data). |
| `window` / `localStorage` not available during SSR | All relevant code is `'use client'`. localStorage access happens inside `useEffect` which only runs in the browser. |
