## Context

The SMS notification feature requires public Privacy Policy and Terms & Conditions URLs for Twilio A2P/10DLC campaign registration. The app already has a branded crimson hero public layout (`src/app/(public)/layout.tsx`) used by `/` and `/login`. These policy pages are purely content pages with no interactive forms.

## Goals / Non-Goals

**Goals:**
- Create `/privacy-policy` and `/terms-and-conditions` as public, unauthenticated routes
- Use the existing crimson hero public layout for consistent branding
- Add footer links to both pages
- Content matches Twilio A2P requirements exactly

**Non-Goals:**
- No database or API changes
- No authentication integration
- No interactive forms on these pages

## Decisions

- **Place pages under `app/(public)/`** to automatically inherit the crimson hero layout and footer from `(public)/layout.tsx`
- **Add routes to `PUBLIC_PATHS` in root layout** so the header is suppressed (consistent with other public pages)
- **Footer links inlined in `(public)/layout.tsx`** since that's where the footer lives; no separate footer component exists
- **Full content in page components** rather than fetching from database since content is static compliance text unlikely to change
- **Copy fits inside the white card** — no scrolling within card needed; the overall page scrolls if content exceeds viewport

## Risks / Trade-offs

- If Twilio requirements change, the page content must be updated in code (not configurable). Acceptable for now since compliance text is rare to change.
- Routes are added to `(public)` group only; `/onboarding` has its own separate layout. We could later extract a shared layout if more public pages are added.
