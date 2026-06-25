## Why

The `/instructor-registration` page uses the `(public)/layout.tsx` which has different proportions than `onboarding/layout.tsx` — larger logo/text on the left, narrower white card on the right. This makes the multi-section instructor form feel cramped and visually inconsistent with the rest of the portal. The user wants the instructor registration page to match the onboarding page's layout (compact branding, wide content area).

## What Changes

- Create a dedicated `layout.tsx` for `src/app/(public)/instructor-registration/` that mirrors `onboarding/layout.tsx`
- The new layout uses the same compact left column (`max-w-[14rem]`, smaller logo `clamp(100px, 18vw, 200px)`) and wide right card (`max-w-md lg:flex-1 lg:max-w-5xl`)
- No changes to the page component's form logic or content
- No changes to other pages in the `(public)` route group (login, etc.)

## Capabilities

### New Capabilities

- `instructor-registration-layout`: Dedicated page layout for the instructor registration flow, visually consistent with the student onboarding layout.

### Modified Capabilities

None. This is a pure UI alignment with no behavioral or requirement changes.

## Impact

- **New file**: `src/app/(public)/instructor-registration/layout.tsx`
- **No changes** to existing layouts, the instructor registration page component, or any other route
- No API, database, or dependency changes
