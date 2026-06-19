## Context

`src/app/onboarding/layout.tsx` uses a centered single-column layout (branding block centered at top, form card below). The public layout (`src/app/(public)/layout.tsx`) for `/` and `/login` uses a two-column desktop layout (branding left, card right) with `lg:flex-row`. The onboarding layout duplicates the same crimson background, logo, serif typography, and footer but in a stacked configuration that wastes horizontal space on desktop.

The onboarding flow has an interstitial intro step (`OnboardingIntro`) that displays a welcome message and a "Begin Registration" button. The landing page (`/`) already has a "Begin Student Onboarding" CTA, making this second click redundant.

## Goals / Non-Goals

**Goals:**
- Adopt the two-column desktop layout from the public layout, but with the left branding pane compacted and the right form card widened
- Reduce the WFD logo size on all viewports so the form card is visible without excessive scrolling
- Eliminate the intro interstitial so students go directly from the landing page to the registration form

**Non-Goals:**
- Modifying the public layout (`(public)/layout.tsx`)
- Redesigning any step component
- Changing the onboarding step sequence (registration → legal → resources → quiz → complete)
- Adding new navigation or transitions

## Decisions

### Decision 1: Two-column layout via `lg:flex-row`

Use the same `flex-col lg:flex-row items-center justify-center` pattern as `(public)/layout.tsx`. The branding block naturally sits left, the card right. No new layout primitives needed — this is purely a flexbox direction change at the `lg` breakpoint.

**Alternative considered**: Keep centered single-column but widen the card. Rejected because it doesn't match the landing/login visual pattern and leaves branding floating awkwardly above a wide card.

### Decision 2: Logo shrunk via CSS `clamp`

Reduce from `clamp(170px, 30vw, 380px)` to `clamp(130px, 26vw, 280px)`. This shrinks the logo ~25% on desktop and ~23% on mobile, keeping it prominent enough for brand recognition while freeing vertical space for the form.

**Alternative considered**: Different logo sizes at different breakpoints via Tailwind classes. Rejected — `clamp()` already provides fluid scaling and avoids breakpoint-specific overrides.

### Decision 3: Card widened to `lg:max-w-xl`

Registration forms contain up to 6 fields (name, email, phone, school, instructor, contact). `lg:max-w-lg` (32rem) is tight for multi-field forms. `lg:max-w-xl` (36rem) gives each field more horizontal room without making the card feel disconnected from the branding.

### Decision 4: Remove intro step from orchestrator

Change `currentStep` initial value from `0` to `1`. Remove `OnboardingIntro` import, `handleBegin` callback, and the case 0 switch branch. Update `handleBack` to `Math.max(1, s - 1)` so back from legal goes to registration (not to the removed intro). Don't pass `onBack` to `RegistrationForm` since it's now the first step with nothing to go back to.

**Alternative considered**: Keep intro but auto-advance on mount. Rejected — flashing the intro screen for a frame is a worse UX than not showing it at all.

## Risks / Trade-offs

- **Smaller logo may feel less grand on desktop** → The landing/login pages keep the larger logo; onboarding prioritizes form space. Brand identity is preserved through the crimson background, serif typography, and gold accents.
- **No back button on registration** → Students who land on registration by accident must use the browser back button. Acceptable — the landing-page CTA is clearly labeled as "Begin Student Onboarding."
