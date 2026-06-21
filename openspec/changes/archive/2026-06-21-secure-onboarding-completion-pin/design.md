## Context

The onboarding completion endpoint is public but performs privileged work with the Supabase service-role client. Today, possession of a `studentId` is enough to create/link a Supabase Auth user, set `students.onboarding_completed_at`, email a 6-digit PIN, and return that PIN to the browser. The product decision is to keep the existing PIN experience: the PIN remains emailed and displayed to the completing student.

## Goals / Non-Goals

**Goals:**

- Require server-verifiable onboarding ownership proof before completing onboarding for a student row.
- Preserve the normal student experience: PIN email, PIN display, and completion-page auto-login remain available for valid sessions.
- Prevent arbitrary callers from completing another student's onboarding by guessing or reusing `studentId`.
- Use cryptographically secure randomness for generated 6-digit PINs.
- Keep invalid/stale/tampered completion attempts visible as clear retry/start-over/help errors.

**Non-Goals:**

- Remove PIN-based onboarding credentials.
- Replace the current PIN flow with Supabase invite links or password reset links.
- Redesign the full onboarding UI or make onboarding cross-device resumable.
- Solve all public onboarding endpoint hardening in one pass, such as legal-signature or quiz-flag authorization.
- Add a broad rate-limiting platform or new external service.

## Decisions

### Decision 1: Use an `onboarding_sessions` table

Create a small server-owned table for onboarding completion proof rather than adding token fields to `students`.

Suggested shape:

```text
onboarding_sessions
- id uuid primary key
- student_id uuid references students(id) on delete cascade
- token_hash text not null
- expires_at timestamptz not null
- completed_at timestamptz null
- created_at timestamptz not null default now()
```

The browser receives the raw token once after registration and stores it with the existing local onboarding session. The database stores only a hash. Completion sends `studentId + onboardingToken`; the server hashes the token and verifies it against an active, unexpired, incomplete session for that student.

**Rationale:** A separate table gives clearer lifecycle and future audit/expiry options without overloading `students`. It also avoids treating enrollment identity as an authorization secret.

**Alternative considered:** Add `onboarding_token_hash` and `onboarding_token_expires_at` to `students`. This is smaller but mixes session state into the enrollment record and makes multiple/restarted sessions harder to reason about.

### Decision 2: Return the raw token from registration only

The registration flow should receive both `studentId` and `onboardingToken` when a pending onboarding row is created or resumed through the intended registration path. The raw token is not stored in the database and is not logged.

**Rationale:** This preserves the single-browser onboarding flow while giving the completion endpoint proof beyond `studentId`.

### Decision 3: Completion endpoint verifies state before service-role auth work

Before creating/linking an Auth user, `/api/notify/onboarding-complete` must verify:

- request body validates as UUID + non-empty token
- matching active onboarding session exists for `studentId`
- session is not expired and not completed
- student exists, is pending, is not blacklisted, and `onboarding_completed_at` is null
- legal signature exists before final completion

Only after these checks should the route create/reuse auth users, set `auth_user_id`, set `onboarding_completed_at`, mark the onboarding session completed, send notifications, and return the PIN.

**Rationale:** The dangerous operation is the service-role auth/linking work. All authorization checks must happen before that boundary.

### Decision 4: Preserve PIN behavior but use secure randomness

Continue generating a 6-digit PIN/password for newly created auth users, emailing it, returning it to the verified browser session, displaying it on the completion screen, and allowing the existing client-side auto-login. Generate the PIN with Node crypto, for example `randomInt(100000, 1000000)`, not `Math.random()`.

**Rationale:** The application is not considered high security, and the desired UX depends on PIN email/display. Secure randomness removes avoidable weakness without changing the product flow.

### Decision 5: Failed verification is a visible onboarding error

When completion proof is missing, expired, mismatched, or already consumed, the endpoint should reject with an appropriate 401/403/409 style response and the frontend should show a clear message telling the student to restart registration or contact their instructor/training staff.

**Rationale:** Normal users should not see a difference. Stale or tampered sessions should fail clearly instead of silently completing the wrong row.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Students who clear localStorage lose the onboarding token | Show a clear restart/help message; existing registration duplicate handling can guide restart behavior. |
| Existing in-progress onboarding sessions from before this change have no token | Treat them as unverifiable and require restart/contact, or provide a short temporary compatibility path only if explicitly needed before implementation. |
| Multiple tabs create confusing token/session state | Use the most recent valid session saved in localStorage; completion consumes the matching session so repeated completion attempts cannot regenerate PINs. |
| Email delivery failure still prevents the student from receiving the PIN by email | Preserve current behavior where the verified browser response displays the PIN even if email fails, if auth setup succeeds. |
| More database work in registration/completion | Keep the table small, indexed by `student_id`, and clean expired/completed sessions later if needed. |

## Migration Plan

1. Add the `onboarding_sessions` table with RLS enabled and no public direct access policies.
2. Update registration server path/RPC/API shape to create a session token and return it with `studentId`.
3. Update browser onboarding session storage to include `onboardingToken`.
4. Update completion calls to send `studentId + onboardingToken`.
5. Update completion endpoint verification and secure PIN generation.
6. Update specs/tests for valid, missing-token, wrong-token, expired-token, and repeated-completion behavior.

Rollback strategy: the migration can remain in place while code is reverted, but reverting code would re-open the public `studentId` completion weakness. Prefer forward fixes over rollback once deployed.

## Open Questions

- Should pre-change in-progress sessions be forced to restart, or should there be a short compatibility window?
- Should the token expire after 24 hours to match localStorage persistence, or should it be shorter/longer?
