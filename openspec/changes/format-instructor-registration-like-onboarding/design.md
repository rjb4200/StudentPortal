## Context

The instructor-registration page lives under the `(public)/` route group and currently inherits `(public)/layout.tsx`. This layout has a large logo (`clamp(170px, 30vw, 380px)`), a wide left column (`max-w-md`), and a narrow right card (`max-w-md lg:max-w-lg`) for content.

The onboarding page has its own `onboarding/layout.tsx` with a more compact left column (`max-w-[14rem]`, smaller logo `clamp(100px, 18vw, 200px)`) and a wider right card (`max-w-md lg:flex-1 lg:max-w-5xl`) that gives multi-section forms room to breathe.

Since the instructor registration form has 3 sections (Instructor, Training Site, Class) with 2-column grids and textareas, the narrower `(public)` layout makes it feel cramped.

## Goals / Non-Goals

**Goals:**
- Make the `/instructor-registration` page visually consistent with `/onboarding`
- Give the multi-section form more horizontal breathing room
- Keep the same gradient background and overall brand feel

**Non-Goals:**
- Changing any form logic, validation, or submission behavior
- Modifying other `(public)` pages (login, etc.)
- Altering the instructor-registration page component itself
- Any database, API, or dependency changes

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Approach | **Dedicated layout file** over modifying `(public)/layout.tsx` | Isolates change to instructor-registration; doesn't affect login or other public pages |
| Layout source | **Mirror `onboarding/layout.tsx`** | Proven pattern that works well for multi-section forms; visual consistency |
| Branding | Use same compact logo `clamp(100px, 18vw, 200px)`, `max-w-[14rem]` left column | Left column is decorative; no need to compete with form content |
| Card width | `max-w-md lg:flex-1 lg:max-w-5xl` | Wide enough for 2-column grids without overflow |
| Footer | Keep simpler footer (copyright only, no privacy/terms links) | Matches onboarding; policy links already exist elsewhere |

## Risks / Trade-offs

- **Duplicate code**: The new layout will be a near-copy of `onboarding/layout.tsx`. If the branding shell changes in the future, both layouts need updating. → Mitigation: Low risk since branding changes are rare and the duplication is small (~50 lines).
- **Route structure**: The page stays under `(public)/` while its layout diverges from the group. → Acceptable; Next.js route groups support per-route layout overrides.
