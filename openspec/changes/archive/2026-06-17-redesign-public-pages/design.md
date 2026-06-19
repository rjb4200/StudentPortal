## Context

The root `layout.tsx` renders an inline crimson header on all public paths (`/`, `/onboarding`, `/login`, `/reset-password`). The landing page and login page are minimal centered cards (`min-h-[80vh] flex items-center justify-center`) with no distinctive branding beyond the header bar. The EB Garamond serif font is loaded but unused on these pages. There are no gradients, hero sections, or decorative elements anywhere in the app.

The existing login page (`login/page.tsx`) is a 276-line client component with full auth logic (student login, admin login, forgot password, status messages from query params). Its form logic must be preserved exactly.

## Goals / Non-Goals

**Goals:**
- Replace the plain centered-card design with a full-viewport crimson hero featuring the WFD logo, serif typography, dark vignette, and a white login card
- Maintain identical auth behavior — all login/logout/forgot-password/status-message logic unchanged
- Ensure responsive design: two-column on desktop, stacked single-column on mobile
- Minimize blast radius: use Next.js route groups so no route strings change and zero imports break
- Keep the existing student/admin toggle (redesigned as subtle pill tabs)

**Non-Goals:**
- Redesign `/onboarding` or `/reset-password` pages (these lose their header but remain self-contained)
- Change any auth middleware, API routes, or server-side logic
- Move authenticated pages (dashboard, admin, preceptor) into route groups
- Add animations beyond Tailwind transitions
- Add a "Remember me" checkbox (not supported by Supabase auth)

## Decisions

### Decision 1: Route group `(public)` over moving all authenticated pages

Moving dashboard, admin, and preceptor into an `(app)` route group would require updating route strings in 17 files (middleware, nav links, redirect logic). Using a `(public)` group that covers only `/` and `/login` avoids touching any of those files. The root layout remains the single-pane layout for authenticated pages — only the header is conditionally hidden for public paths.

**Alternative considered:** Move all 10 page files into route groups. Touches 17 files, high risk of regressions, and the benefit (perfect separation) isn't worth the cost for a visual redesign.

### Decision 2: Conditional header in root layout

```tsx
// root layout.tsx — modified
const publicPage = isPublicPath(pathname);
// ...
{publicPage ? (
  children  // raw — (public)/layout.tsx provides the hero wrapper
) : (
  <>
    <header> ... unchanged header ... </header>
    <main className="...">{children}</main>
  </>
)}
```

This keeps onboarding and reset-password rendering without any wrapper (they're self-contained) while `/` and `/login` get the hero from their route group layout.

### Decision 3: Inline vignette style over custom Tailwind utility

Tailwind doesn't ship `radial-gradient`. Adding a custom plugin or `@layer` utility for a single use is overkill. An inline `style` prop on the overlay div is simpler and self-documenting.

```tsx
<div
  className="absolute inset-0 pointer-events-none"
  style={{
    background: 'radial-gradient(ellipse at center, transparent 30%, rgba(95,0,0,0.6) 100%)',
  }}
/>
```

### Decision 4: Reuse existing Input/Button components

The login form uses the existing `Input` and `Button` UI components. This preserves consistent focus rings, error states, and loading spinners. Only the card wrapper, typography, and spacing change.

### Decision 5: Two separate `page.tsx` files — not a single smart component

The landing page (`(public)/page.tsx`) is a simple server component with two CTA links. The login page (`(public)/login/page.tsx`) is a client component with full form logic. No shared abstraction needed — they share the hero wrapper via the layout.

## Risks / Trade-offs

- **Onboarding loses its header**: The header was crimson on public pages. Onboarding has its own `OnboardingIntro` hero component that already uses crimson background + logo, so losing the header is unnoticeable — the page starts with a crimson banner either way. → Low risk.
- **Reset password page loses its header**: It's a standalone centered card. Without the header bar it'll render as a simpler card. Acceptable since this page is visited briefly during a password reset flow. → Low risk.
- **Mobile viewport height**: The `min-h-screen` on the crimson hero may cause scrolling issues on mobile with the form card. → Mitigation: Use `min-h-screen` on the outer container but allow overflow (`overflow-y-auto`). On very short screens, the content scrolls naturally.
- **Vignette on light backgrounds**: The dark vignette overlay uses `rgba(95,0,0,0.6)` which may wash out on some displays. → Mitigation: The solid crimson background underneath ensures the page reads as "red" even if the vignette effect is subtle.

## Open Questions

None — the design is fully specified by the user's Hybrid Option B mockup.
