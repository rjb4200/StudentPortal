## Why

The onboarding flow works functionally but feels like a prototype — a bare stepper with numbered circles and minimal guidance. EMS students filling this out between calls on mobile need to know where they are, what's left, and that their progress won't be lost. The WFD branding (already in the header) should carry through the entire onboarding experience to feel like an official department workflow rather than a form on a generic website.

## What Changes

- **5-step horizontal stepper** replacing the current 4-step inline circles, with step titles, descriptions, and progress percentage. The "Submitted" step is now visible as the finish line from the start.
- **WFD-branded intro hero** before the stepper with department context, estimated completion time, and a prominent start button.
- **Help/contact information** visible on every step so students can reach instructors without abandoning the flow.
- **Save/resume via localStorage** — students who close the browser or lose connection can return and pick up where they left off.
- **Better mobile stepper** — collapses to a compact "Step X of 5" bar with progress bar on small screens instead of trying to fit 5 circles horizontally.
- **Enhanced step cards** with WFD-inspired section title underlines (`border-bottom` accent), consistent typography hierarchy, and back navigation between steps.
- **WFD design alignment** — incorporate design patterns from `rjb4200/wfdwebsite`: section title underlines, hover-lift cards, notice banners, the olive-green accent (`#6A994E`) for completed states, and the official logo red (`#A40104`) replacing the current crimson (`#B61C20`).
- **Cleanup** — remove the three unused legacy quiz components (`mcq-section.tsx`, `image-grid-quiz.tsx`, `hotspot-quiz.tsx`) that are dead code from earlier quiz iterations.

## Capabilities

### New Capabilities
- `onboarding-wizard-ui`: The redesigned onboarding page with 5-step horizontal stepper, progress percentage, WFD intro hero, help/contact, and back navigation. Mobile-adaptive layout.
- `onboarding-persistence`: Save/resume via localStorage — persist step, studentId, and form data across browser sessions. Prompt to resume on return.

### Modified Capabilities
- `student-onboarding`: The existing spec describes hotspot quizzes, image grids, and setting `is_certified = true` on quiz completion — none of which match the current codebase. Spec must be updated to reflect the actual rule-by-rule photo quiz, the `pending` → admin-approval flow, and the 5-step wizard structure.

## Impact

- **`src/app/onboarding/page.tsx`** — major rewrite: new stepper component, intro hero, localStorage state management, help/contact integration
- **`src/components/onboarding/`** — each step component gets enhanced headers with WFD underline styling; step cards receive back navigation and help footers
- **New components** — `OnboardingStepper`, `OnboardingIntro`, `OnboardingHelp`, `SaveResumeBanner`
- **`tailwind.config.ts`** — change `wfd-crimson` from `#B61C20` to `#A40104` (WFD logo red); add `wfd-sage` (#6A994E) color for completed states
- **`src/app/globals.css`** — optional: EB Garamond font import for intro/ceremonial text
- **Removed files** — `mcq-section.tsx`, `image-grid-quiz.tsx`, `hotspot-quiz.tsx` (dead code)
- **No database changes** — save/resume uses localStorage only; no new columns
- **No API changes** — step components retain same props contracts
- **No breaking changes** — students see a different UI but the flow, data, and completion behavior are identical
