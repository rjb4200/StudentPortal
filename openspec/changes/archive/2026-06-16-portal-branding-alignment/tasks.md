## 1. Design Tokens & Fonts

- [x] 1.1 Update `tailwind.config.ts` — add Roboto Condensed to `fontFamily.sans`, add EB Garamond to `fontFamily.serif`
- [x] 1.2 Update `src/app/globals.css` — replace Inter import with Roboto Condensed import (weights 400, 700), keep EB Garamond import, set `font-display: swap` on both

## 2. UI Components (fix once, ripples everywhere)

- [x] 2.1 Update `src/components/ui/button.tsx` — replace `hover:bg-red-700` with `hover:brightness-90`, `hover:bg-gray-800` with `hover:brightness-125`, add `sage` variant
- [x] 2.2 Update `src/components/ui/badge.tsx` — replace `bg-yellow-500` with `bg-wfd-gold`, `bg-green-100 text-green-800` with `bg-wfd-sage/15 text-wfd-sage`, `bg-red-100 text-red-800` with `bg-wfd-crimson/15 text-wfd-crimson`, `bg-blue-100 text-blue-800` with `bg-wfd-charcoal/10 text-wfd-charcoal`, `bg-orange-100 text-orange-800` with `bg-wfd-gold/15 text-wfd-gold`
- [x] 2.3 Update `src/components/ui/card.tsx` — add hover-lift effect (`hover:-translate-y-1` transition) when `hover` prop is true
- [x] 2.4 Update `src/components/ui/input.tsx` — replace `border-red-500` with `border-wfd-crimson` in error state, replace `text-red-600` with `text-wfd-crimson` for error text
- [x] 2.5 Update `src/components/ui/modal.tsx` — replace `border-gray-200` header divider with tokenized border, replace `text-gray-400 hover:text-gray-600` close button with tokenized colors

## 3. Header & Layout

- [x] 3.1 Convert `src/app/layout.tsx` to client component with `usePathname` — crimson header bg on public paths (`/`, `/onboarding`, `/login`, `/expired`, `/blacklisted`, `/reset-password`), charcoal on all others
- [x] 3.2 On crimson header: change department name from `text-wfd-crimson` to `text-white` with text-shadow, subtitle from `text-gray-400` to `text-wfd-gold italic`
- [x] 3.3 Change body background from `bg-white` to `bg-[#f9f9f9]` in layout

## 4. Public Pages

- [x] 4.1 Update `src/app/page.tsx` — replace `hover:bg-red-700` and `hover:bg-gray-800` on CTA buttons, tokenize subtitle gray
- [x] 4.2 Update `src/app/login/page.tsx` — replace bare `<input>` elements with `Input` component, replace bare `<button>` with `Button` component, replace `bg-green-50/bg-red-50` feedback messages with sage/crimson tints, tokenize tabs and labels
- [x] 4.3 Update `src/app/expired/page.tsx` — replace `bg-amber-100` with gold tint, `hover:bg-red-700` with brightness
- [x] 4.4 Update `src/app/blacklisted/page.tsx` — replace `bg-red-100` with crimson tint
- [x] 4.5 Update `src/app/reset-password/page.tsx` — replace bare inputs/buttons with components, replace `bg-green-100` icon with sage tint, replace `text-red-600` error with crimson

## 5. Authenticated Pages

- [x] 5.1 Update `src/app/dashboard/page.tsx` — replace `bg-amber-50 border-amber-200` pending card with gold tints, replace `bg-blue-50 border-blue-200` welcome card with sage/charcoal tints, replace `bg-gray-100 text-gray-600 hover:bg-gray-200` tab buttons with charcoal tints, replace `text-red-600` error with crimson
- [x] 5.2 Update `src/app/admin/page.tsx` — replace `border-gray-200` tab bar, `text-gray-500 hover:text-gray-700` inactive tabs, `text-gray-700 hover:bg-gray-50` dropdown items with charcoal-tinted variants
- [x] 5.3 Update `src/app/preceptor/page.tsx` — tokenize subtitle and footer grays

## 6. Dashboard & Admin Sub-components

- [x] 6.1 Update `src/components/dashboard/calendar-grid.tsx` — replace hardcoded day colors with WFD palette
- [x] 6.2 Update `src/components/dashboard/evaluation-form.tsx` — replace hardcoded rating button colors, `bg-gray-100 hover:bg-gray-200` with charcoal tints
- [x] 6.3 Update `src/components/dashboard/messages.tsx` — tokenize message bubble colors
- [x] 6.4 Update `src/components/dashboard/shift-modal.tsx` — replace `bg-red-50` with crimson/10 tint
- [x] 6.5 Update `src/components/admin/daily-ops.tsx` — replace `bg-red-600` delete with `bg-wfd-crimson`, `bg-green-100 text-green-700` / `bg-red-100 text-red-700` toggles with sage/crimson tints, `bg-green-500` / `bg-blue-500` dots with palette colors, generic grays with charcoal tints, `text-orange-600` with gold
- [x] 6.6 Update `src/components/admin/maintenance-archive.tsx` — replace `text-green-600` success, `text-red-700` danger, `text-orange-600` warning with respectively `wfd-sage`, `wfd-crimson`, `wfd-gold`

## 7. Verification

- [x] 7.1 Run `npm run build` and confirm zero errors
- [x] 7.2 Visually verify: header is crimson on `/`, `/onboarding`, `/login` — charcoal on `/dashboard`
- [x] 7.3 Visually verify: dashboard cards use gold/sage/charcoal — no amber or blue
- [x] 7.4 Visually verify: buttons, badges, inputs use WFD palette across all pages
- [x] 7.5 Visually verify: Roboto Condensed renders as the primary font on all pages
- [x] 7.6 Visually verify: onboarding styling is not regressed
