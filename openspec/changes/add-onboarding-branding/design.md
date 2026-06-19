## Context

`(public)/layout.tsx` provides a crimson hero layout used by `/` and `/login` — full-viewport crimson background with dark vignette, WFD logo, serif headings, gold accents, white card for `{children}`, and charcoal footer. The layout is a two-column split: branding left, card right. Onboarding has no layout at all — it renders in the bare root layout with a gray background, no logo, no branding.

The existing step content is rendered by individual components (`registration-form`, `legal-waiver`, `resource-library`, `knowledge-gate`, `onboarding-complete`) that each handle their own title and internal structure. A page orchestrator is needed to render these in sequence.

## Goals / Non-Goals

**Goals:**
- Give onboarding the same crimson branding as `/` and `/login` — logo, department name, serif typography, gold accents, vignette, footer
- Adapt the layout from two-column split to centered single-column for the multi-step wizard
- Preserve all existing step components unchanged
- Keep the implementation minimal — one new layout file, no changes to existing code

**Non-Goals:**
- Redesigning the individual step components
- Changing the onboarding flow or step ordering
- Adding new navigation beyond what the stepper components already provide
- Creating a shared layout component (the two-column and single-column layouts have different enough structure that abstraction isn't worth it)

## Decisions

### Decision 1: Dedicated layout file over modifying `(public)/layout.tsx`

Adding an `onboarding/layout.tsx` inside the `(public)` route group gives onboarding its own layout while `/` and `/login` keep theirs. Next.js route groups allow nested layouts — `(public)/layout.tsx` wraps all public pages, and `(public)/onboarding/layout.tsx` overrides it specifically for `/onboarding`.

Wait — actually, Next.js nested layouts work differently. A `layout.tsx` in `onboarding/` would NOT override the parent `(public)/layout.tsx` — it would nest INSIDE it. The parent layout wraps the child layout.

Better approach: Don't put onboarding inside `(public)/`. Move it to the root level. The root layout already strips headers for public paths. The onboarding layout can be a standalone `onboarding/layout.tsx` at the project root level (e.g., `src/app/onboarding/layout.tsx`) that provides:
- Crimson background + vignette
- WFD branding block (logo, department name, portal title, tagline)
- `{children}` for step content
- Charcoal footer

This way onboarding doesn't inherit the two-column `(public)/layout.tsx` wrapper.

### Decision 2: Layout structure mirrors `(public)/layout.tsx` branding, single-column

```tsx
// (public)/onboarding/layout.tsx
<div className="relative min-h-screen bg-wfd-crimson flex flex-col">
  {/* Vignette overlay */}
  <div ...radial gradient... />

  {/* Centered single-column content */}
  <div className="relative z-10 flex-1 flex flex-col items-center">
    {/* Branding block */}
    <div>WFD logo, department name, EMS Student Portal, tagline</div>

    {/* White content card */}
    <div className="bg-white rounded-2xl shadow-2xl ...">
      {children}
    </div>
  </div>

  {/* Footer */}
  <div>© Winchester Fire Department · Division of EMS</div>
</div>
```

### Decision 3: Page orchestrator (from existing patterns)

The onboarding page needs to render the correct step component based on the current step. This is a pre-existing pattern from the old `onboarding/page.tsx`. The page:
- Tracks `currentStep` (0 = intro, 1-4 = steps, 5 = complete)
- Renders `OnboardingIntro`, `RegistrationForm`, `LegalWaiver`, `ResourceLibrary`, `KnowledgeGate`, or `OnboardingComplete`
- Passes `studentId` through a state lifted up from registration

**Alternative considered:** Server component with search params for step. More complex, adds URL state management, and onboarding steps have form state that requires client rendering. Client component with `useState` is simpler.

## Risks / Trade-offs

- **Branding duplication**: The crimson background, vignette, logo, and typography are copied from `(public)/layout.tsx`. → Mitigation: Acceptable for two layouts. If a third page needs this pattern, extract shared components. Not worth it for two.
- **Step components may have their own internal headers**: The individual step components render their own `<h2>` titles with `border-b-2 border-wfd-crimson`. These remain inside the white card. → No conflict — the layout provides the page-level branding, steps provide their own content-level headers.
