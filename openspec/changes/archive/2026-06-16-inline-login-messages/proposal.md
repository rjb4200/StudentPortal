## Why

The student login flow currently redirects users away from the login page to `/onboarding`, `/expired`, or `/blacklisted` when their student record has a non-active status — without telling them why. Users are yanked to a different page with no explanation of what happened or what to do next. This also applies to authenticated users whose session is blocked by middleware or the auth callback route.

## What Changes

- **Login page**: Replace all 4 `window.location.href` redirects in `handleStudentLogin` with inline contextual messages. Each message includes the failure reason and, where appropriate, an action button linking to the next step (onboarding, re-registration).
- **Middleware**: Redirect dashboard-access rejections to `/login?reason=X` instead of dedicated `/blacklisted` and `/expired` pages, so the user lands on the login page with the appropriate message displayed.
- **Auth callback route**: Same redirect-destination change as middleware — redirect denial states to `/login?reason=X`.
- **Delete dedicated pages**: Remove `src/app/blacklisted/page.tsx` and `src/app/expired/page.tsx`. Their content is absorbed into the login page's inline message system.
- **Layout**: Remove `/expired` and `/blacklisted` from `PUBLIC_PATHS`.
- **Dev navigation**: Remove dead links to deleted pages.

## Capabilities

### New Capabilities

- `login-failure-feedback`: Inline contextual failure messages with optional action links on the login page, replacing opaque redirects for all student-status rejection paths.

### Modified Capabilities

- `authentication-authorization`: Login pre-check and session-access enforcement redirect targets change from dedicated pages to `/login?reason=X` with inline messaging. Scenarios affected: password login for expired/archived/blacklisted students, no-account email, and session-timeout redirects.
- `student-dashboard`: Dashboard access-control redirect destinations change from `/onboarding` and dedicated pages to `/login?reason=X`.

## Impact

- **Files modified**: `src/app/login/page.tsx` (main rework), `src/middleware.ts`, `src/app/auth/callback/route.ts`, `src/app/layout.tsx`, `src/app/admin/dev/page.tsx`
- **Files deleted**: `src/app/blacklisted/page.tsx`, `src/app/expired/page.tsx`
- **No API changes, no new dependencies, no database migrations**
- **Breaking**: The `/blacklisted` and `/expired` URL paths will return 404 after this change
