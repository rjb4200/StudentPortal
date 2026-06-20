## Context

The app currently uses valid auth/account routes, but several user-facing links are built from the current request or browser origin. That works when users are on the production deployment, but it can leak preview, localhost, or stale deployment origins into password reset and notification links. Supabase Auth also requires reset redirect URLs to be allowed in hosted Auth URL settings.

## Goals / Non-Goals

**Goals:**

- Centralize the public StudentPortal app URL used for user-facing auth/account links.
- Keep login, dashboard, password reset, onboarding, and auth callback links constrained to routes that actually exist.
- Document the matching Supabase hosted Auth URL settings.
- Keep the change small and avoid altering the broader auth lifecycle.

**Non-Goals:**

- Refactor authorization middleware or role checks.
- Redesign student approval, audit logging, or notification delivery.
- Add new auth providers or change Supabase Auth configuration programmatically.

## Decisions

- Use a canonical app URL environment variable rather than request-derived origins for outbound links. This makes emailed links stable regardless of preview deployments or proxy host headers.
- Keep relative in-app navigation unchanged where the user is already browsing the app. Relative links such as `/login` and `/dashboard` remain correct for ordinary page navigation.
- Use the canonical app URL for Supabase password reset `redirectTo` so reset emails align with production Auth URL configuration.
- Document Supabase Auth dashboard settings in repo instructions because hosted Auth URL Configuration is external to the codebase.

## Risks / Trade-offs

- Missing canonical app URL in production could break auth link generation. Mitigation: validate the environment variable with the existing env helper pattern and document it in `.env.example` and repo instructions.
- Local development password reset links would point to production if the canonical URL is production-only. Mitigation: developers can set the local value to `http://localhost:3000` in `.env.local`, while Vercel production uses the production URL.
- Supabase dashboard settings still require manual alignment. Mitigation: document exact expected Site URL and redirect paths as deployment configuration.
