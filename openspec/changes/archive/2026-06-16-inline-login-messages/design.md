## Context

The login page (`src/app/login/page.tsx`) currently performs a pre-authentication lookup on the `students` table by email. Based on the student's status, it either allows the sign-in attempt or immediately redirects via `window.location.href` to `/onboarding`, `/blacklisted`, or `/expired`. The middleware (`src/middleware.ts`) and auth callback (`src/app/auth/callback/route.ts`) perform similar status checks and redirect authenticated users to these dedicated pages. Users receive no explanation of why they were redirected.

This design replaces all redirects with a single pattern: stay on the login page (pre-auth) or redirect to `/login?reason=X` (post-auth), and display an inline contextual message with an optional action link.

## Goals / Non-Goals

**Goals:**
- Keep the user on the login page for all pre-auth student-status rejection paths
- Show a clear, human-readable reason for each failure with a visual type (error vs warning)
- Provide an action button when a corrective next step exists (re-register, start onboarding)
- Consolidate post-auth denial redirects to `/login?reason=X` so the login page is the single information hub
- Delete the now-unnecessary `/blacklisted` and `/expired` pages

**Non-Goals:**
- Changing the middleware or callback's fundamental role (they still enforce access control)
- Removing the pre-login email lookup (privacy trade-off is accepted; immediate feedback is valued)
- Adding a permanent "register" link on the login page (the action link appears only in failure messages)
- Modifying the admin login flow

## Decisions

### Decision 1: Extended LoginMessage type

Replace the current `{ type: 'success' | 'error'; text: string }` with a richer type that can carry an optional action payload:

```ts
type LoginMessage = {
  type: 'error' | 'warning' | 'success';
  text: string;
  actionLabel?: string;
  actionHref?: string;
};
```

**Why**: The current type has no way to attach a call-to-action. Adding `actionLabel` and `actionHref` lets the message rendering layer produce a button/link without coupling the message state to navigation logic. The `warning` type distinguishes recoverable states (expired, archived, no-record) from terminal errors (blacklisted, invalid password).

**Alternatives considered**:
- Always render a link in the message text via HTML — fragile, couples content to rendering.
- Use a separate `action` state variable — adds state synchronization complexity for no gain.

### Decision 2: Reason query parameter on /login

All post-auth denial redirects (middleware, callback) point to `/login?reason=expired|blacklisted|archived|not-registered`. The login page reads this parameter on mount and displays the corresponding message immediately.

**Why**: This makes the login page the single surface for all denial states, eliminating the need for dedicated `/blacklisted` and `/expired` pages. The query parameter is a standard web pattern that requires no new routes, no cookie wrangling, and no state-passing hacks.

**Alternatives considered**:
- Create a unified `/access-denied?reason=X` page — requires a new route, duplicates the message rendering logic already on the login page.
- Keep the dedicated pages — defeats the goal of a single information hub.
- Redirect to `/onboarding?reason=X` — mixes registration flow with denial messaging, less cohesive.

### Decision 3: URL param reading via useEffect + window.location.search

The login page reads the `reason` query parameter in a `useEffect` using `window.location.search` rather than `useSearchParams()` from `next/navigation`.

**Why**: `useSearchParams()` requires a `<Suspense>` boundary in Next.js 15 App Router, which would force restructuring the login page into a wrapper + inner component pattern. The `useEffect` approach is a single-line addition that avoids this complexity. The one-frame delay before the message renders is imperceptible (~16ms) and only occurs on the error path — normal login flow is unaffected.

**Alternatives considered**:
- `useSearchParams()` with `<Suspense>` wrapper — correct but adds unnecessary component nesting for a single query param read.
- Server Component with `searchParams` prop — the login page is already `'use client'` due to form state and Supabase client usage; converting to a server/client split adds complexity.

### Decision 4: Warning color using wfd-gold

The `warning` message type uses the existing `wfd-gold` Tailwind color (`#D4AF37`): `bg-wfd-gold/10 text-wfd-gold border border-wfd-gold/30`.

**Why**: The palette already defines `wfd-gold` and it semantically maps to "caution, not terminal." It's already used in the header for the public-page subtitle and provides a distinct visual signal from crimson (error/terminal) and sage (success).

### Decision 5: No signOut in middleware before redirect

The middleware and callback redirect to `/login?reason=X` without calling `supabase.auth.signOut()` first.

**Why**: Adding signOut in the middleware introduces complexity around cookie manipulation on the redirect response (the `createServerClient` pattern in middleware uses `setAll` on a `NextResponse.next()` response, not the redirect response). The user's session is harmless — if they attempt to log in again, the pre-login check catches their status and shows the same message. If their status later changes (admin un-blacklists them), their existing session becomes valid again without needing to re-authenticate.

## Risks / Trade-offs

- **[Risk] One-frame flash on reason-based message display** → The component renders once before `useEffect` fires. Mitigation: The flash is ~16ms, invisible to users. Only affects the error path, not normal login.
- **[Risk] Removed pages break hard links** → `/blacklisted` and `/expired` return 404 after deletion. Mitigation: These were internal redirect targets, not user-facing bookmarks. The admin dev page links are updated. No external references exist.
- **[Risk] Authenticated user sees login form** → When middleware redirects to `/login?reason=expired`, the user has a valid session but sees a login form. Mitigation: The reason message appears at the top, explaining why they were sent there. The pre-login check provides a consistent experience if they re-enter credentials.
- **[Trade-off] Pre-login email lookup remains** → The login page still queries the `students` table before authentication, revealing email existence. This is existing behavior preserved for UX (immediate feedback before password entry). The privacy concern is accepted for this government training portal use case.
