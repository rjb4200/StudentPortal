## Context

The WFD website (`rjb4200/wfdwebsite`) defines the department's visual identity: crimson `#A40104` background header, olive-green `#6A994E` accents, Roboto Condensed typography, EB Garamond ceremonial text, section underlines, and hover-lift cards. The onboarding wizard already applies these patterns. The rest of the portal uses generic Tailwind utility colors and the Inter font.

This is a pure styling change — zero behavior, logic, API, or database modifications. Every component and page keeps its existing functionality. Only colors, fonts, and visual patterns change.

## Goals / Non-Goals

**Goals:**
- Portal uses WFD design tokens (`wfd-crimson`, `wfd-sage`, `wfd-gold`, `wfd-charcoal`) exclusively — no hardcoded red/green/blue/amber utilities
- Roboto Condensed is the primary font; EB Garamond is available via `font-serif`
- Header background is crimson on public pages, charcoal on authenticated pages
- Body background matches WFD reference: `#f9f9f9`
- All UI components (Button, Badge, Card, Input, Modal) use tokenized colors
- Onboarding styling is not regressed (it was already aligned)

**Non-Goals:**
- No behavior changes — every page works identically
- No new UI variants beyond what's needed to replace hardcoded colors
- No WFD website CSS import — all changes use existing Tailwind patterns
- No design system documentation or Storybook

## Decisions

### Decision 1: Replace hardcoded colors without adding opacity scales

**Choice**: Replace `bg-red-100 text-red-800` with `bg-wfd-crimson/15 text-wfd-crimson` using Tailwind's built-in opacity modifier syntax instead of defining a full color scale in `tailwind.config.ts`.

**Rationale**: Tailwind 3 supports arbitrary opacity via `bg-wfd-crimson/15` without requiring a 50/100/200/... scale definition. This avoids bloating the config while achieving the same result.

**Alternatives considered**:
- Full color scale in config — more discoverable but extra maintenance
- New `wfd-crimson-light` token for each shade — duplicates the opacity pattern

### Decision 2: Keep gray scale as Tailwind default

**Choice**: Continue using `text-gray-500`, `bg-gray-100`, `border-gray-200` for neutral/structural elements rather than defining `wfd-gray-*` tokens.

**Rationale**: The WFD website doesn't define a proprietary gray scale — it uses standard web grays. Mapping these to Tailwind's built-in gray scale is the most maintainable approach. Only semantic colors (red, green, gold) need WFD-specific tokens.

### Decision 3: Header background detection via URL path

**Choice**: The `layout.tsx` header uses a `usePathname()` hook (client component) to determine if the current route is public or authenticated, and applies `bg-wfd-crimson` or `bg-wfd-charcoal` accordingly.

```tsx
'use client';
const pathname = usePathname();
const isPublic = ['/', '/onboarding', '/login', '/expired', '/blacklisted', '/reset-password'].some(
  (p) => pathname === p || pathname.startsWith(p + '?')
);
const headerBg = isPublic ? 'bg-wfd-crimson' : 'bg-wfd-charcoal';
```

**Rationale**: Simple path-based detection avoids middleware complexity or cookie inspection. The layout is already a client component in Next.js App Router (it renders children). Adding `usePathname` is a lightweight hook call.

**Alternatives considered**:
- Server component with `headers()` — can't read pathname reliably on Vercel
- Middleware setting a cookie — overcomplicates for a visual-only change
- Separate layouts for public vs authenticated routes — requires restructuring the route tree

### Decision 4: Font strategy — swap Inter for Roboto Condensed

**Choice**: Replace Inter with Roboto Condensed as the primary `font-sans`. EB Garamond becomes `font-serif` via Tailwind config.

```js
// tailwind.config.ts
fontFamily: {
  sans: ['Roboto Condensed', 'system-ui', 'sans-serif'],
  serif: ['EB Garamond', 'Georgia', 'serif'],
}
```

**Rationale**: Roboto Condensed is the WFD website's primary font. It's narrower, more professional, and more distinctive than Inter. Students and admins see the same font family across both the public website and the portal.

**Alternatives considered**:
- Keep Inter — simpler but misses the branding opportunity; the portal feels disconnected from the main site

### Decision 5: Button component — brightness over hardcoded hover colors

**Choice**: Replace `hover:bg-red-700` with `hover:brightness-90` so the hover state is derived from the base color rather than hardcoded.

```js
primary: 'bg-wfd-crimson text-white hover:brightness-90 focus:ring-wfd-crimson',
secondary: 'bg-wfd-charcoal text-white hover:brightness-125 focus:ring-wfd-charcoal',
danger: 'bg-wfd-crimson text-white hover:brightness-90 focus:ring-wfd-crimson', // same as primary
sage: 'bg-wfd-sage text-white hover:brightness-90 focus:ring-wfd-sage', // new variant
```

**Rationale**: The `brightness` filter works on any background color without needing a complementary dark shade defined for each token. A single approach handles all variants.

**Alternatives considered**:
- `hover:bg-wfd-crimson-dark` token — requires defining darker shades for each color
- `hover:opacity-90` — affects text readability as well as background

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Roboto Condensed is narrower — layouts may shift | Test at 375px and 1440px. Button text, tab labels, and card titles are the most likely overflow points. |
| `usePathname` in layout forces client rendering | The layout is already a client boundary due to Supabase providers. No additional impact. |
| Header color change is jarring for returning users | The contrast is intentional — public pages feel like the WFD website, authenticated pages feel like a tool. |
| `brightness` filter may not work on all Tailwind colors | Tested with `wfd-crimson`, `wfd-charcoal`, `wfd-sage` — all are solid hex colors, `brightness` works. |
