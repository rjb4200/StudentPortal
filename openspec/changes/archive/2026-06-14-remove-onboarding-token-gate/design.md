## Context

The onboarding page is currently accessible only when the request includes `?token=WFD_TRAINING_2026` or the configured `ONBOARDING_TOKEN` value. Middleware enforces this token and several links/redirects hard-code the tokenized URL. Dashboard and admin access are separately protected by Supabase auth, student status, blacklist state, and expiration checks.

## Goals / Non-Goals

**Goals:**

- Make `/onboarding` directly accessible without a query token.
- Remove token validation from middleware.
- Update hard-coded onboarding links and redirects to use `/onboarding`.
- Remove project documentation that describes `ONBOARDING_TOKEN` as required.
- Preserve existing dashboard and admin protections.

**Non-Goals:**

- Do not change registration form fields or onboarding step order.
- Do not change Supabase RLS policies or onboarding RPC behavior.
- Do not add replacement invitation-code, rate-limit, or CAPTCHA behavior in this change.
- Do not change approval, certification, blacklist, or expiration rules.

## Decisions

### Remove middleware gating for `/onboarding`

The onboarding route should no longer be included in middleware solely for token validation. The middleware should continue protecting `/admin` and `/dashboard`.

Alternative considered: keep `/onboarding` in middleware but allow all requests. This was rejected because it adds unnecessary middleware work and preserves a misleading protection path.

### Redirect to plain `/onboarding`

Any code path that currently constructs or hard-codes `/onboarding?token=WFD_TRAINING_2026` should redirect or link to `/onboarding`. This includes dashboard fallback redirects, auth callback fallback, the homepage button, expired re-registration, and admin dev links.

Alternative considered: keep old tokenized URLs while disabling validation. This was rejected because the visible URL would still imply a token requirement that no longer exists.

### Leave old tokenized links naturally compatible

No special compatibility code is needed for existing links containing `?token=WFD_TRAINING_2026`. Once validation is removed, the onboarding page will ignore unused query parameters and still load.

Alternative considered: explicitly strip the query parameter with redirects. This was rejected as unnecessary for the current requirement and would add extra routing behavior.

## Risks / Trade-offs

- [Risk] Public onboarding may receive more unwanted submissions -> Mitigation: Admin approval remains required before dashboard access, and spam controls can be considered as a future change if needed.
- [Risk] Documentation drift leaves references to the old token -> Mitigation: Search for `ONBOARDING_TOKEN`, `WFD_TRAINING_2026`, and tokenized onboarding URLs during implementation.
- [Risk] Removing `/onboarding` from middleware accidentally affects dashboard/admin protection -> Mitigation: Limit middleware matcher changes to onboarding only and verify `npm run build`.
