## Why

The "View Shift Details" button on `/dashboard` renders with white text on a white/light background, making it unreadable. Root cause: the `<Button>` component's default `variant="primary"` applies `bg-wfd-crimson text-white`, which conflicts with the explicit `className` overrides (`bg-white text-wfd-crimson`). Tailwind's CSS cascade resolves these conflicting classes in an order that can produce invisible text.

## What Changes

- Replace the `<Button>` component with a plain `<button>` element for the command card primary action button.
- Apply all styling classes directly without depending on component variant defaults that conflict.
- Keep the same intended visual design: white button with crimson text, matching the secondary button pattern already used in the same section.

## GitHub Issue

#86 - Fix View Shift Details button color contrast on dashboard

## Root Cause

The Button component's default `variant="primary"` injects `bg-wfd-crimson text-white` before the `className` prop's `bg-white text-wfd-crimson`. When custom Tailwind colors (`wfd-crimson`) conflict with built-in colors (`white`), the cascade order can produce white text on a white/light background.

## Proposed Solution

Replace `<Button>` with a native `<button>` element and apply all classes directly to avoid variant style conflicts. The secondary button in the same section (line 276) already uses this pattern.

## Scope

- `src/app/dashboard/page.tsx` — command card primary button (line 273)

## Non-goals

- No changes to the Button component itself (it works correctly elsewhere).
- No changes to other buttons or styling.
- No changes to button behavior or layout.

## Risk Assessment

- Regression Risk: Low (1/10). Single button replacement, same visual design, same behavior.
- Fix Confidence: High (10/10). Direct cause understood, well-defined fix.
- Verification Confidence: High (10/10). Visual inspection and build verification.

## Verification Plan

1. Confirm the code compiles: `npm run build`
2. Verify classes produce white background with crimson text
3. Verify hover/focus/disabled states are preserved

## Rollback Plan

Restore the `<Button>` component usage on the single line.
