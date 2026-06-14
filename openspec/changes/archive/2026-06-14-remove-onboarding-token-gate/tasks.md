## 1. Middleware Cleanup

- [x] 1.1 Remove the `ONBOARDING_TOKEN` constant and token-specific onboarding URL helper from `src/middleware.ts`.
- [x] 1.2 Change dashboard fallback redirects to point to `/onboarding` without query parameters.
- [x] 1.3 Remove the `/onboarding` token validation block from middleware.
- [x] 1.4 Remove `/onboarding/:path*` from the middleware matcher while preserving `/dashboard` and `/admin` protection.

## 2. Link and Redirect Updates

- [x] 2.1 Update the homepage onboarding link to `/onboarding`.
- [x] 2.2 Update the expired re-registration link to `/onboarding`.
- [x] 2.3 Update auth callback fallback redirects to `/onboarding`.
- [x] 2.4 Update admin dev onboarding links to `/onboarding`.

## 3. Documentation and Spec Cleanup

- [x] 3.1 Remove `ONBOARDING_TOKEN` from `AGENTS.md` environment variable documentation.
- [x] 3.2 Update `AGENTS.md` auth/access notes to describe onboarding as anonymous access at `/onboarding`.
- [x] 3.3 Search for remaining active references to `WFD_TRAINING_2026`, `ONBOARDING_TOKEN`, and `/onboarding?token=` outside archived change history.

## 4. Verification

- [x] 4.1 Run `npm run build` to verify the Next.js application compiles.
- [x] 4.2 Manually verify `/onboarding` is not token-gated by reviewing the final middleware matcher and removed validation branch.
