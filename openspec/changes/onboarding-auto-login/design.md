## Context

The onboarding completion flow returns a temporary password for new accounts but provides no action path to use it. Students must manually navigate to `/login` and type credentials they just received. The `OnboardingComplete` component shows the same UI (credentials box) for both new and existing accounts, causing confusion for students who already have WFD auth accounts.

The existing middleware already allows `status = 'pending'` students to access `/dashboard` (with limited functionality), so auto-login is safe — the student won't see sensitive content before approval.

## Goals / Non-Goals

**Goals:**
- Give newly created accounts a one-click "Continue to Dashboard" path from the completion page
- Differentiate the completion page UI between new and existing accounts
- Keep existing-account students from seeing temporary credentials they don't need
- No new database tables, no URL-based tokens, no server-side token management

**Non-Goals:**
- Server-side token exchange system (explicitly rejected in favor of client-side)
- Changing the temporary password generation or email sending
- Modifying the dashboard's pending-student view
- Auto-login for existing accounts (security requirement)

## Decisions

### 1. Client-side sign-in (Option A over Option B)

**Decision**: Use `sessionStorage` to hold the temporary password briefly and call `supabase.auth.signInWithPassword()` from the completion page.

**Rationale**: 
- No new database tables or migrations required
- No server-side token management / refresh token storage complexity
- The password is already returned in the API response body — it's in the client's JS memory regardless
- `sessionStorage` is cleared when the tab closes, so the password doesn't persist across sessions
- The password is never placed in a URL query parameter

**Alternative considered**: Server-side token exchange with `onboarding_login_tokens` table. Rejected as over-engineered for this use case. The password is already in transit — adding a token layer adds complexity without meaningfully improving security.

### 2. API response shape

**Decision**: Add `isNewAccount: boolean` to the existing response `{ success, password, email }`.

**Rationale**: Backward compatible — existing consumers ignore unknown fields. The `isNewAccount` flag is derived from whether `tempPassword` was generated (line 23-30 of the API route), which the server already knows.

### 3. Props plumbing

**Decision**: Expand `KnowledgeGate.onComplete` from `(password, email)` to `(password, email, isNewAccount)`.

**Rationale**: The `OnboardingComplete` component needs `isNewAccount` to render the correct UI path. The data flows from the API through `KnowledgeGate.handleComplete` to `OnboardingPage.handleQuizComplete` to `OnboardingComplete` props. Minimal change to existing signatures.

### 4. Completion page layout

**Decision**: Two distinct UI sections based on `isNewAccount`:

New account:
- Success checkmark + title
- Message body (from template or default)
- Credentials box (email + password)
- **"Continue to Dashboard"** primary button → calls `signInWithPassword`, redirects to `/dashboard`
- "Go to Login" secondary link → links to `/login`

Existing account:
- Success checkmark + title
- Message body (from template or default)
- Info box: "Use your existing WFD credentials..."
- **"Go to Login"** primary button → links to `/login`
- No credentials box, no auto-login button

**Rationale**: The new-account CTA is the most prominent action; the password is a fallback. The existing-account path is clean and unambiguous.

### 5. Error handling for auto-login

**Decision**: If `signInWithPassword` fails (expired temp password, network error), silently redirect to `/login` with the email pre-filled.

**Rationale**: The common failure case is that the student opens the completion page, waits days for admin approval, then clicks "Continue." By then the temp password has already been emailed — so falling back to the login page is the correct recovery path. No need for complex error states on the completion page.

## Risks / Trade-offs

- **Password in sessionStorage briefly** → Acceptable risk. The password is already in the API response body and in the student's email inbox. `sessionStorage` has the same origin restrictions as the rest of the page. Cleared on tab close.
- **Auto-login fails if admin hasn't approved yet** → The middleware allows `pending` students to access `/dashboard` (with limited view). This is intentional — the student lands on a "pending approval" dashboard, not the full dashboard.
- **"Continue" clicked after temp password expires** → Falls back to `/login`. The password was already emailed, so student can look it up.
