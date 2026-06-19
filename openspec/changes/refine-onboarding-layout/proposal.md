## Why

The onboarding page wastes horizontal space on desktop with a centered single-column layout while `/` and `/login` use an efficient two-column design. The oversized logo pushes the registration form below the fold on mobile. And the interstitial "Begin Registration" intro screen is an unnecessary second click after the landing page's "Begin Student Onboarding" button — students should go straight to the form.

## What Changes

- **Two-column desktop layout** in `src/app/onboarding/layout.tsx`: branding pane left (compact), form card right (wider), matching the `/` and `/login` pattern
- **Smaller WFD logo** on all viewports: `clamp(130px, 26vw, 280px)` instead of `clamp(170px, 30vw, 380px)` so the form is visible without scrolling
- **Wider form card** on desktop: `lg:max-w-xl` instead of `lg:max-w-lg` for multi-field registration forms
- **Remove intro step** from `src/app/onboarding/page.tsx`: skip `OnboardingIntro`, start directly at `RegistrationForm` — eliminates one unnecessary click in the flow

## Capabilities

### Modified Capabilities
- `branded-public-pages`: The onboarding desktop layout scenario changes from centered single-column to two-column with compact branding; mobile logo shrinks; the intro interstitial is removed from the onboarding flow

## Impact

- **Modified files**: `src/app/onboarding/layout.tsx`, `src/app/onboarding/page.tsx`
- **Zero changes** to step components, public layout, API routes, or database
