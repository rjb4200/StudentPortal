## Context

The current branded public page spec requires the landing page CTA to navigate directly to `/onboarding` and requires `/onboarding` to display the registration flow without an intro interstitial or secondary "Begin Registration" CTA. Issue #110 identifies `src/components/onboarding/onboarding-intro.tsx` as leftover code from the previous interstitial flow.

## Goals / Non-Goals

**Goals:**

- Remove the unused intro component.
- Preserve direct `/onboarding` registration behavior.
- Verify no stale imports or references remain.

**Non-Goals:**

- No UI redesign.
- No onboarding flow changes.
- No database, Supabase, RLS, migration, or API changes.

## Decisions

- Delete the component rather than leaving a comment or deprecating it, because it is unused and conflicts with the direct-to-form flow.
- Use search plus build/test verification to confirm removal is safe.

## Risks / Trade-offs

- Hidden reference missed by text search -> Mitigated by `npm run build` type/module resolution.
- Future desire to reintroduce an intro screen -> Mitigated by git history and explicit spec language that the current flow has no interstitial.
