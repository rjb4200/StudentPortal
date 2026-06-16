## Context

The current onboarding page (`src/app/onboarding/page.tsx`) is a single client component with inline stepper JSX and `useState<Step>` for navigation. The stepper shows only 4 of 5 steps (missing "Submitted"), has no progress percentage, no intro context, no help/contact, and no persistence across browser sessions. State is lost on refresh.

The WFD website (`rjb4200/wfdwebsite`) provides a design reference with:
- **Colors**: Primary red `#A40104`, accent olive-green `#6A994E`, dark `#333`, light backgrounds `#f9f9f9`
- **Typography**: Roboto Condensed (headings), EB Garamond (ceremonial text)
- **Patterns**: Section titles with `border-bottom` accent underline, hover-lift cards (`translateY(-5px)`), hero overlays, amber-left-border notice banners

This redesign is purely a frontend UI change. No database migrations, no API modifications, no quiz logic changes. Every step component retains its existing props contract.

## Goals / Non-Goals

**Goals:**
- 5-step horizontal stepper with titles, descriptions, and progress percentage visible at all times
- WFD-branded intro hero section before the stepper with department context and start button
- Help/contact information accessible from every step
- Save/resume via localStorage — survive browser close/refresh
- Mobile-adaptive stepper that collapses to a compact bar on small screens
- WFD design patterns applied to step cards (section underline, notice banners, hover effects)
- Back navigation between steps
- Remove unused legacy quiz components

**Non-Goals:**
- No database changes (save/resume is localStorage only; no `onboarding_step` column)
- No API route changes (step components keep same props)
- No auth middleware changes (onboarding remains anonymously accessible)
- No quiz logic changes (the rule-by-rule photo quiz in `knowledge-gate.tsx` is unchanged)
- No registration RPC changes (`register_onboarding_student` stays as-is)
- Cross-device sync (localStorage is per-browser; cross-device would require DB)

## Decisions

### Decision 1: Stepper as a separate component

**Choice**: Extract stepper into `src/components/onboarding/onboarding-stepper.tsx`.

**Rationale**: The current inline JSX in `page.tsx` is 35 lines of circles-and-bars rendering. Extracting it:
- Makes `page.tsx` focus on orchestration only
- Allows the stepper to have its own mobile-responsive logic
- Reusable if onboarding ever gets sub-routes

**Alternatives considered**: Keeping it inline — rejected because the page would bloat with 5 steps + mobile variants.

### Decision 2: localStorage schema for save/resume

**Choice**: Store a single JSON key `wfd_onboarding_session`:

```json
{
  "studentId": "uuid | null",
  "currentStep": 1,
  "timestamp": "ISO-8601",
  "email": "string"
}
```

- `studentId` is `null` until step 1 completes (RPC returns it)
- `currentStep` is 1–5
- `timestamp` enables a "session expired" check (24h staleness)
- `email` enables the resume prompt to identify the student

**Rationale**: Simple flat structure. One key avoids namespace collisions. 24h staleness prevents showing a resume prompt for abandoned sessions from weeks ago.

**Alternatives considered**:
- Multiple keys (`wfd_step`, `wfd_student_id`, etc.) — more complex cleanup, harder to reason about
- URL-based state — URL could be bookmarked/shareable, exposing studentId in URLs is undesirable
- DB column — requires migration, doesn't help before step 1 (no student row yet)

### Decision 3: Mobile stepper collapse

**Choice**: At `< 640px` breakpoint, collapse the horizontal stepper to a single bar:

```
Step 2 of 5  ·  40% complete
████████████████░░░░░░░░░░░░░░
Legal Agreements
```

**Rationale**: Five circles with connector bars on a 375px screen is ~65px per circle including gaps — too tight for readable labels. A single progress bar with "Step X of 5" is the standard mobile wizard pattern (used by Typeform, Stripe onboarding, etc.).

**Alternatives considered**:
- Vertical stepper — takes significant vertical space before content, pushes the form below the fold
- Just hiding labels — circles alone are ambiguous ("what's step 3 again?")

### Decision 4: Intro hero placement

**Choice**: Show the intro hero *before* the stepper on step 1 only. Once the user clicks "Begin Registration," the hero collapses and the stepper + step card appear. The hero does not show again.

**Rationale**: The hero sets context and builds confidence. Keeping it persistent above the stepper would waste vertical space. A one-time splash pattern matches onboarding wizards in professional products.

**Alternatives considered**:
- Persistent hero bar — would compress step content on mobile
- No hero — misses the branding opportunity
- Separate landing page at `/onboarding` with a `/onboarding/wizard` sub-route — overcomplicates routing

### Decision 5: Back navigation strategy

**Choice**: Each step component (except step 1 and step 5) receives an `onBack: () => void` prop. The stepper shows a "Previous" button using the secondary charcoal variant.

**Rationale**: Back navigation is a natural consequence of save/resume — if a student can return to a later step, they should also be able to go back and edit. The onBack callback is managed by the parent orchestrator, not individual step components.

**Alternatives considered**:
- Clickable stepper circles to jump steps — rejected because steps have dependencies (can't do legal before register)
- No back button — rejected because save/resume without back navigation feels broken

### Decision 6: WFD design alignment approach

**Choice**: Apply WFD design patterns via Tailwind utilities and a new `wfd-sage` color, not by pulling in the WFD website's raw CSS.

- Add `wfd-sage: '#6A994E'` to `tailwind.config.ts`
- Use `border-b-2 border-wfd-crimson` for step section title underlines
- Use `bg-wfd-sage` for completed-state stepper circles (replacing `bg-green-500`)
- Use the amber-left-border notice pattern for important step messages
- Apply `transition-transform hover:-translate-y-1` to interactive cards

**Rationale**: The portal already uses Tailwind with its own `wfd-*` palette. Adding a sage color and adopting the underline/hover patterns keeps the design system in Tailwind. Pulling in raw WFD CSS would create specificity conflicts.

**Alternatives considered**: Direct CSS copy — conflicts with Tailwind's utility classes; the WFD site uses raw CSS with different class naming conventions.

### Decision 7: Align primary red to WFD logo color

**Choice**: Change `wfd-crimson` from `#B61C20` to `#A40104` in `tailwind.config.ts`.

**Rationale**: The WFD logo and the official department website (`rjb4200/wfdwebsite`) use `#A40104` as their primary red. Matching this color ensures the Student Portal feels like part of the WFD brand family. Since `wfd-crimson` is used throughout the entire portal (buttons, active states, header text, badges), this is a single-line Tailwind config change that updates the whole app atomically.

**Alternatives considered**: Keeping `#B61C20` — the colors are visually similar but side-by-side the portal would look like it's using a different shade than the logo in the header.

### Decision 8: Legacy quiz component removal

**Choice**: Delete `mcq-section.tsx`, `image-grid-quiz.tsx`, `hotspot-quiz.tsx` from `src/components/onboarding/`.

**Rationale**: These files were part of earlier quiz iterations. The current `knowledge-gate.tsx` implements its own photo-selection quiz inline. The old components are dead code with no imports anywhere in the codebase.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| localStorage is cleared (browser settings, private mode) | Session prompt checks for key on load; if missing, start fresh. No data loss — student just starts from step 1. |
| localStorage is shared across subdomains | Use specific key name `wfd_onboarding_session` to avoid collisions with other WFD apps. |
| Student opens onboarding in two tabs | Last-write-wins for localStorage. Acceptable trade-off for simplicity; edge case is rare. |
| Step component prop changes break when adding `onBack` | `onBack` is optional (`onBack?: () => void`). Steps 1 and 5 don't receive it. Existing prop contracts unchanged. |
| Mobile stepper bar is less informative than full stepper | The bar shows current step number, step title, and progress bar. Students who need more context can rotate to landscape or use a larger device. |
| EB Garamond font adds ~200KB of font files if self-hosted | Use Google Fonts CDN with `font-display: swap` to avoid render blocking. Only load the 400 and 700 weights. |

## Open Questions

- Should the intro hero include a background image (fire station photo) or stay solid crimson? A photo requires a Supabase storage bucket entry.
- Should the help/contact be a floating FAB button, a footer section in each step card, or a slide-out drawer? Footer section is simplest but FAB is more discoverable.
- Should the stepper show checkmarks for completed steps or just fill them with sage-green? Checkmarks match the current pattern and are clearer.
