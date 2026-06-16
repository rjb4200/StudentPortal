## Why

After completing onboarding, new students are shown a temporary password on screen and emailed it. But they must then navigate to `/login`, manually type the email and temporary password, and sign in — a friction point right when they're most engaged. Existing-account students get confusing mixed messaging (both "use your existing password" and a credentials box). This change gives new accounts a one-click "Continue to Dashboard" path while keeping existing accounts cleanly separate.

## What Changes

- **Client-side auto-login for new accounts**: The temp password returned from the API is briefly held in sessionStorage. A "Continue to Dashboard" button on the completion page calls `signInWithPassword` directly, then redirects to `/dashboard`. No server token, no new DB tables, no URL exposure of credentials.
- **Differentiated completion page**: New-account students see a prominent "Continue to Dashboard" CTA alongside their credentials. Existing-account students see only "Use your existing WFD credentials" and a "Go to Login" link. No credentials box for existing accounts.
- **API returns account type**: `POST /api/notify/onboarding-complete` now returns `{ isNewAccount: boolean }` in addition to `{ password, email }`, so the frontend knows which UI to render.
- **KnowledgeGate passes through**: The quiz completion handler propagates `isNewAccount` from the API through to the `OnboardingComplete` component.

## Capabilities

### New Capabilities
- `onboarding-auto-login`: Client-side one-click sign-in for newly created student accounts using the temporary password held in sessionStorage. The completion page displays a "Continue to Dashboard" button that calls `supabase.auth.signInWithPassword()` and redirects to `/dashboard` on success.

### Modified Capabilities
- `onboarding-completion-flow`: The API response now includes `isNewAccount`. The completion screen behavior splits into two distinct paths — new-account (credentials + auto-login CTA + secondary /login link) and existing-account (instructions to use existing password + /login link). No credentials are shown for existing accounts.
- `student-onboarding`: The `OnboardingComplete` component receives `isNewAccount` prop and renders conditional UI. The `KnowledgeGate.onComplete` callback signature expands to include `isNewAccount`.

## Impact

- **Files**: `src/app/api/notify/onboarding-complete/route.ts` (add `isNewAccount` to response), `src/components/onboarding/onboarding-complete.tsx` (conditional UI with auto-login button), `src/components/onboarding/knowledge-gate.tsx` (pass through `isNewAccount`), `src/app/onboarding/page.tsx` (new state + updated callback)
- **Database**: None — no new tables or columns
- **API**: `POST /api/notify/onboarding-complete` response shape adds `isNewAccount: boolean`
- **Dependencies**: None
- **BREAKING**: None — existing `password` and `email` fields remain in the response
