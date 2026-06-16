## Why

The onboarding wizard was recently redesigned to match the WFD website (`rjb4200/wfdwebsite`) — crimson red, sage green, EB Garamond accents, section underlines. But the rest of the portal (dashboard, admin, login, landing page, UI components) still uses generic Tailwind colors: `bg-amber-50`, `hover:bg-red-700`, `bg-blue-50`, `bg-green-100`. The portal should feel like a cohesive WFD EMS product from every page, not a Tailwind prototype with one branded section.

## What Changes

### Header
- **Context-aware header color**: crimson (`#A40104`) background on public pages (`/`, `/onboarding`, `/login`), charcoal (`#1C1C1E`) on authenticated pages (`/dashboard`, `/admin`, `/preceptor`). Department name becomes white on crimson, gold subtitle with italic.
- **Font**: Roboto Condensed replaces Inter as the primary body font. EB Garamond moved from inline `style=` to Tailwind `fontFamily` utility class (`font-serif`).

### UI Components (fix once, ripples everywhere)
- **Button**: replace hardcoded `hover:bg-red-700` with `hover:brightness-90`, `bg-red-600` danger with `bg-wfd-crimson`, add `sage` variant
- **Badge**: replace `bg-yellow-500` with `bg-wfd-gold`, `bg-green-100/text-green-800` with `bg-wfd-sage/15 text-wfd-sage`, `bg-red-100/text-red-800` with `bg-wfd-crimson/15 text-wfd-crimson`, `bg-blue-100` with `bg-wfd-charcoal/10`
- **Card**: add WFD hover-lift effect (`hover:-translate-y-1`), tokenize border color
- **Input**: replace `border-red-500` error state with `border-wfd-crimson`, `text-red-600` error text with `text-wfd-crimson`
- **Modal**: tokenize border and close-button colors

### Pages (remove generic Tailwind one-offs)
- **Dashboard**: amber alerts → gold-bordered, blue welcome card → sage/charcoal, generic tab buttons → charcoal-tinted
- **Admin**: generic grays → charcoal-tinted grays, `bg-red-600` → `bg-wfd-crimson`, activity dots use palette colors
- **Login**: bare `<input>` elements → `Input` component, bare `<button>` → `Button` component, feedback colors → crimson/sage tints
- **Landing, Expired, Blacklisted, Reset Password, Preceptor**: generic colors → palette tokens
- **Calendar grid, evaluation form, messages, shift modal**: hardcoded colors → tokens

### Design Tokens
- **Body background**: `bg-white` → `bg-[#f9f9f9]` (matches WFD reference)
- **Opacity scale**: enable `bg-wfd-crimson/15` usage by ensuring Tailwind parses custom color opacity variants
- **Gray scale**: no new tokens needed — use Tailwind `gray-*` for neutrals (acceptable fallback)

## Capabilities

### New Capabilities
- `portal-design-system`: A branded design system applied to all UI components (Button, Badge, Card, Input, Modal) and global styles (fonts, body background, header) using WFD design tokens.
- `context-aware-header`: The global layout header changes background color based on whether the current route is public (`/`, `/onboarding`, `/login`) or authenticated (`/dashboard`, `/admin`, `/preceptor`).

### Modified Capabilities
- `student-dashboard`: Color palette changed from amber/blue/generic to gold/sage/crimson-tinted. Layout and behavior unchanged.
- `admin-command-center`: Color palette changed from generic grays/reds to charcoal/wfd-crimson tints. Layout and behavior unchanged.
- `authentication-authorization`: Login page styling uses `Input`/`Button` components with branded colors instead of bare HTML elements. Behavior unchanged.

## Impact

- **`tailwind.config.ts`** — add Roboto Condensed to `fontFamily.sans`, add EB Garamond to `fontFamily.serif`
- **`src/app/globals.css`** — replace Inter import with Roboto Condensed, add `font-display: swap`
- **`src/app/layout.tsx`** — conditional header bg (crimson vs charcoal), body bg `#f9f9f9`, Roboto Condensed on body
- **`src/components/ui/button.tsx`** — replace hardcoded hover colors, add sage variant
- **`src/components/ui/badge.tsx`** — replace all variant colors with wfd-* palette
- **`src/components/ui/card.tsx`** — add hover-lift, tokenize border
- **`src/components/ui/input.tsx`** — tokenize error colors
- **`src/components/ui/modal.tsx`** — tokenize border/close colors
- **`src/app/page.tsx`** — replace hardcoded hover colors
- **`src/app/login/page.tsx`** — use Input/Button components, tokenize colors
- **`src/app/dashboard/page.tsx`** — replace amber/blue with gold/sage
- **`src/app/admin/page.tsx`** — tokenize tab bar and dropdown colors
- **`src/app/expired/page.tsx`**, **`src/app/blacklisted/page.tsx`**, **`src/app/reset-password/page.tsx`**, **`src/app/preceptor/page.tsx`** — tokenize colors
- **`src/components/admin/daily-ops.tsx`** — replace generic grays/reds/greens with tokens
- **`src/components/admin/maintenance-archive.tsx`** — tokenize alert colors
- **`src/components/dashboard/*.tsx`** — tokenize calendar, evaluation, messages, shift modal colors
