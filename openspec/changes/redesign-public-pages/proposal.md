## Why

The landing page (`/`) and login page (`/login`) are the first impression for every student and prospective student. Currently they use a minimal centered-card layout with a generic header bar — functional but plain, lacking the visual presence expected of a fire department EMS training portal. The WFD brand (crimson, gold, Garamond serif, department logo) is underutilized on these critical entry points.

## What Changes

- **Remove the crimson header bar** from public pages in the root layout — pages render without the traditional header
- **Create a `(public)` route group** with a crimson hero layout shared by `/` and `/login`
- **Redesign `/` (landing)**: Full-viewport crimson background with dark vignette, centered WFD logo and serif branding on the left, white card with CTA buttons on the right. Desktop: two-column. Mobile: stacked single column.
- **Redesign `/login`**: Same crimson hero layout. White login card with student/admin toggle, email/password fields, forgot password link, "New student?" and "Need help?" secondary action boxes. All existing login logic preserved.
- **Footer** on public pages: slim charcoal bar with "© Winchester Fire Department · Division of EMS"
- Delete old `src/app/page.tsx` and `src/app/login/` — replaced by route group equivalents

## Capabilities

### New Capabilities

- `branded-public-pages`: Crimson hero design system for public-facing pages. Full-viewport WFD-branded layouts with logo, serif typography (EB Garamond for display, Roboto Condensed for UI), dark vignette overlay, responsive two-column (desktop) / stacked (mobile) architecture, and consistent white card + charcoal footer pattern.

### Modified Capabilities

None — this is a purely visual redesign. All existing auth behavior, login flow logic, form handling, status messages, and route navigation remain unchanged.

## Impact

- **3 new files**: `(public)/layout.tsx`, `(public)/page.tsx`, `(public)/login/page.tsx`
- **2 deleted files**: `page.tsx` (root landing), `login/page.tsx` (root login)
- **1 modified file**: `layout.tsx` (root layout — conditional header rendering)
- **Zero route string changes**: Route groups don't affect URL paths — all existing links, redirects, and middleware continue to work
- **Zero API changes**, no database changes, no new dependencies
