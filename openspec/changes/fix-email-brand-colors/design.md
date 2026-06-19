## Context

Four email routes (`onboarding-complete`, `approve-student`, `schedule/cancel`, `schedule-action`) use inline HTML with `background:#A40104` for the crimson fill and `border:1px solid #8a1518` for button borders. The `#8a1518` is undefined in the WFD brand palette. The same `buildEmailHtml()` helper is copy-pasted in `schedule/cancel` and `schedule-action`. Two evaluation emails (`evaluation-receipt`, `flagged-evaluation`) have no WFD branding at all.

The existing `src/lib/email.ts` contains only the `sendEmail()` transport wrapper with no HTML template logic.

## Goals / Non-Goals

**Goals:**
- Single brand crimson (`#A40104`) across all email buttons and headers
- Shared `buildEmailHtml()` and brand constants in `src/lib/email.ts` — one source of truth
- Deduplicate the copy-pasted template function
- Add WFD logo header to evaluation emails for brand consistency

**Non-Goals:**
- Full email template redesign (layout, content, typography stay as-is)
- Changing the `sendEmail()` transport function
- Adding new email template types

## Decisions

### Decision 1: Replace `#8a1518` with `#A40104`, no third color

The button border is removed entirely — the box-shadow (`rgba(164,1,4,0.25)`) already provides visual depth. Simplifies from two reds to one.

```diff
- border:1px solid #8a1518;box-shadow:0 4px 12px rgba(164,1,4,0.25)
+ box-shadow:0 4px 12px rgba(164,1,4,0.25)
```

### Decision 2: Export `buildEmailHtml()` and brand constants from `src/lib/email.ts`

```ts
export const EMAIL_LOGO_URL = 'https://ejjsahtohaydoogtilgp.supabase.co/storage/v1/object/public/branding/wfd-logo-1848.jpg';
export const EMAIL_CRIMSON = '#A40104';
export const EMAIL_CHARCOAL = '#1C1C1E';

export function buildEmailHtml(title: string, bodyHtml: string, loginUrl: string): string {
  // WFD-branded HTML email template with crimson header, logo, charcoal divider
}
```

All routes import these instead of hardcoding. The two existing `buildEmailHtml()` copies in `schedule/cancel` and `schedule-action` are removed.

### Decision 3: Minimal branding for evaluation emails

The evaluation emails currently have zero branding. Adding the full WFD template (logo, header, footer) to these plain `<p>`-tag emails would be a redesign, not a color fix. The minimum fix: wrap the existing content in a WFD logo header strip (the same `crimson background + logo + department name` that all other emails use) but keep the body content as-is. This gives brand consistency without scope creep.

### Decision 4: Onboarding-complete and approve-student keep their inline HTML

These two routes build their HTML dynamically with per-student data inside the template (credential boxes, student names). The `buildEmailHtml()` function accepts a `bodyHtml` string and wraps it in the standard header/footer — these routes already have the `bodyHtml` ready. They just need to import and call `buildEmailHtml()` instead of duplicating the wrapper HTML.

## Risks / Trade-offs

- **Button border removal**: The `#8a1518` border provided a darker edge on the crimson button. Removing it means the button "floats" on the white background with only the shadow for depth. → Mitigation: The shadow (`0 4px 12px rgba(164,1,4,0.25)`) is sufficient at normal email viewing sizes. If needed, a subtle `#720002` (darker crimson) border could be added, but that's a third color.
- **Evaluation email branding**: Adding the logo header means these emails now contain an `img` tag. Some email clients block images by default. → Mitigation: The `alt` text on the logo provides fallback. This is the same pattern used by the other four email routes.
