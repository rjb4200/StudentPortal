## Why

The onboarding page currently renders with no WFD branding at all — just a bare gray background with no logo, no department header, and no navigation. The landing page (`/`) and login page (`/login`) use a rich crimson hero layout with the WFD logo, serif typography, and gold accents. Onboarding should receive the same branded treatment, adapted for its multi-step wizard structure.

## What Changes

- **Create `(public)/onboarding/layout.tsx`**: A branded wrapper that reuses the same crimson background, vignette, WFD logo, department name, serif typography, and charcoal footer from the existing `(public)/layout.tsx` — adapted from a two-column split to a centered single-column layout suitable for the multi-step onboarding flow
- **Restore the onboarding page**: The orchestrator page that loads the current step component must be present for the layout to render

## Capabilities

### Modified Capabilities

- `branded-public-pages`: The crimson hero design system now extends to the onboarding page via a dedicated onboarding layout adapted from the existing landing/login layout

## Impact

- **2 new files**: `(public)/onboarding/layout.tsx` (branded wrapper), `(public)/onboarding/page.tsx` (orchestrator)
- **Zero changes** to existing layouts, components, or API routes
- **Zero database changes**, zero new dependencies
