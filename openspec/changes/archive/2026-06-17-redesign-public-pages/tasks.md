## 1. Root Layout — Conditional Header

- [x] 1.1 Modify `src/app/layout.tsx`: remove the inline header from public paths. Render `{children}` directly for public pages (no header, no main wrapper). Keep the existing header + main wrapper for non-public pages.

## 2. Public Route Group — Crimson Hero Layout

- [x] 2.1 Create `src/app/(public)/layout.tsx`: full-viewport crimson background with dark radial vignette overlay, two-column responsive layout (desktop: branding left + card right, mobile: stacked), WFD logo, serif department label and heading, white card wrapper for `{children}`, charcoal footer bar with copyright text

## 3. Landing Page Card

- [x] 3.1 Create `src/app/(public)/page.tsx`: white card with "Welcome" heading (serif), subtitle text, two CTA buttons ("Begin Student Onboarding" linking to `/onboarding`, "Sign In" linking to `/login`) each with a description subtitle, and two secondary action boxes side-by-side ("New student?" → `/onboarding`, "Need help?" → mailto link)

## 4. Login Page Card

- [x] 4.1 Create `src/app/(public)/login/page.tsx`: port the full login logic from `src/app/login/page.tsx` with restyled JSX — white card with student/admin pill toggle, "Welcome back" heading (serif), email and password inputs using existing `Input` component, "Forgot password?" link, crimson "Sign In" button using existing `Button` component, error/warning/success message alerts, and two secondary action boxes at the bottom

## 5. Cleanup

- [x] 5.1 Delete `src/app/page.tsx` (replaced by `(public)/page.tsx`)
- [x] 5.2 Delete `src/app/login/page.tsx` (replaced by `(public)/login/page.tsx`)

## 6. Verification

- [x] 6.1 Run `npm run build` to verify no compilation errors
- [x] 6.2 Visually verify: check `/` and `/login` at desktop and mobile widths, confirm student login works, confirm admin login works, confirm forgot password works, confirm status messages from query params display correctly
