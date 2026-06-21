# Fix Onboarding Stepper Complete Step

## GitHub Issue

- Fixes #36: Bug: onboarding stepper is missing final step

## Why

The onboarding flow reaches a final completion screen at step 5, but the progress indicator must clearly represent that final state as the Complete step. The current stepper already includes a fifth step, but labels it `Submitted`, which does not match the issue acceptance criteria or the completion screen concept.

## What Changes

Rename the final onboarding stepper label from `Submitted` to `Complete` in both desktop and mobile steppers while preserving the existing five-step progress behavior.

## Root Cause

The stepper label drifted from the intended completion-screen terminology after the fifth step was added.

## Proposed Solution

Use `Complete` as the final step label everywhere the onboarding stepper renders.

## Scope

- Desktop onboarding stepper final-step label.
- Mobile onboarding stepper final-step label.

## Non-Goals

- No onboarding flow restructuring.
- No database or Supabase changes.
- No visual redesign beyond the final-step label correction.

## Risk Assessment

- Regression risk is low because this is a display-only text change.
- The existing step count, progress percentage, and active/completed state behavior remain unchanged.

## Verification Plan

- Run `npm run build` to verify the Next.js app compiles.
- Inspect the changed components to confirm desktop and mobile labels both use `Complete` for step 5.

## Rollback Plan

Revert the stepper label changes in `src/components/onboarding/onboarding-stepper.tsx` and `src/components/onboarding/onboarding-stepper-mobile.tsx`.
