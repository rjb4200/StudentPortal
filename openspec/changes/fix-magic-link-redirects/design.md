## Context

Two issues exist with magic link redirects and middleware error pages:

1. The `signInWithOtp` API requires `redirect_to` at the top level of the JSON body, not nested inside `options`. Both API routes currently nest it inside `options`, causing the redirect target to be the base domain without `/dashboard`.

2. Blacklisted and expired students are redirected to `/onboarding` which requires a token parameter. Without the token, they see "Access Denied" — a dead end with no explanation.

## Goals / Non-Goals

**Goals:**
- Fix the `redirect_to` placement so magic links correctly redirect to `/dashboard`.
- Create dedicated, no-token-required pages for blacklisted and expired students.
- Update middleware to redirect to the correct pages.

**Non-Goals:**
- Changing the onboarding token gate.
- Adding additional student states or pages.
- Changing the expiration or blacklist logic.

## Decisions

### 1. `redirect_to` at top level, not inside `options`

The Supabase Auth OTP endpoint expects:
```json
{ "email": "...", "create_user": false, "redirect_to": "https://..." }
```

Not:
```json
{ "email": "...", "create_user": false, "options": { "redirectTo": "https://..." } }
```

**Rationale:** The `signInWithOtp` client SDK wraps `redirectTo` inside `options`, but the raw REST endpoint requires `redirect_to` at the top level. Our API routes call the REST endpoint directly.

### 2. `/blacklisted` and `/expired` as simple static pages

No token required. No links on `/blacklisted`. Single re-register link on `/expired` that points to `/onboarding?token=WFD_TRAINING_2026`.

**Rationale:** These are informational pages, not authenticated routes. They explain the situation and provide next steps where appropriate.

### 3. Middleware redirects use hard-coded URLs, not the helper

The `onboardingUrl` helper is for `/onboarding` redirects only. Blacklisted and expired redirects don't need the token.

## Risks / Trade-offs

- **[Risk] `/blacklisted` and `/expired` are accessible to anyone who knows the URL** → Mitigation: These pages contain no sensitive information — just a generic message. They're intentionally public.
- **[Risk] Expired student could bookmark the re-register link and bypass the normal flow** → Mitigation: The onboarding page requires the token parameter regardless. No security bypass.

## Migration Plan

1. Fix `redirect_to` in both API routes (2 lines).
2. Create `/blacklisted/page.tsx`.
3. Create `/expired/page.tsx`.
4. Update middleware redirects.
5. Run build and verify.
