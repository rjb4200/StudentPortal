## Context

Five API routes send email via raw `fetch()` to Resend's API after completing state-changing operations (auth user creation, DB updates). Two failure modes exist:

1. **Onboarding-complete**: A single `try/catch` wraps both the critical path (auth creation + DB link) and the email path. A Resend network error throws, triggering `catch` → returns 500. But the auth user is already created — the student exists in Supabase Auth but the frontend never gets the password.
2. **Approve-student, schedule/cancel, schedule-action**: Bare `await fetch()` with **no error handling at all**. If Resend throws, the API crashes with an unhandled rejection — the state change succeeded but the caller sees a network error.

All routes inline the same boilerplate: `fetch('https://api.resend.com/emails', { headers: { Authorization: Bearer ... }, body: JSON.stringify({ from, to, subject, html }) })`. No timeout, no retry, no shared abstraction.

The frontend `knowledge-gate.tsx` uses `catch {}` (empty block) which silently swallows all failures — even JSON parse errors or 500 responses — leaving the student with `password=null` and a misleading success screen.

## Goals / Non-Goals

**Goals:**
- Make email sending a non-blocking side effect in all five API routes
- Auth creation, password delivery (API response), and DB state changes succeed regardless of Resend availability
- Add a timeout to Resend calls so a hung connection doesn't block the response indefinitely
- DRY the duplicated Resend fetch pattern into a shared utility
- Surface errors to the frontend so students see meaningful feedback instead of silent failure

**Non-Goals:**
- Retry logic (exponential backoff, queue-based delivery) — out of scope for this fix
- Email template management (content is not changing)
- Monitoring/alerting on email failures (just structured console logging)
- Adding a background job system (e.g., Inngest, QStash)

## Decisions

### Decision 1: Split try/catch — email after return, not inside the guard

The onboarding-complete route currently wraps everything in one `try`. The fix moves email sending to AFTER the success return path conceptually — but since we can't `return` before sending (Next.js route handler), we wrap ONLY the email calls in their own try/catch, separate from the auth creation try/catch.

```
BEFORE:
try {
  createAuthUser()     // irreversible
  linkStudentToAuth()
  sendEmail()          // can throw → rolls back success response
  return 200
} catch { return 500 }

AFTER:
try {
  createAuthUser()     // irreversible
  linkStudentToAuth()
} catch { return 500 }

// Email is independent — failure here does not affect the response
try { sendAdminEmail() } catch { console.error(...) }
try { sendStudentEmail() } catch { console.error(...) }

return 200  // ALWAYS returned if auth succeeded
```

**Alternatives considered:**
- *Fire-and-forget without await*: Would work in Node but Next.js Edge/Vercel may terminate the runtime before the fetch completes. Safer to await with a timeout.
- *Move email to a separate background endpoint*: Over-engineering for this scope. Adds complexity (queue, worker) with no clear benefit given email is already best-effort.

### Decision 2: Shared `sendEmail()` utility with timeout

Extract to `src/lib/email.ts`:

```ts
export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}): Promise<{ ok: boolean; error?: string }>
```

- Wraps `fetch` with `AbortController` timeout (5 seconds)
- Returns `{ ok, error }` instead of throwing — callers opt into error handling
- Default `from` address varies by caller (onboarding@ vs noreply@)
- Logs structured errors with status and body snippet

**Why not throw?** The whole point is to prevent email failures from propagating. Returning `{ ok: false }` makes it explicit that the caller should decide what to do, and the default is to log and continue.

### Decision 3: Frontend empty catch → surface errors

The `catch {}` in `knowledge-gate.tsx` becomes:

```ts
try {
  const res = await fetch('/api/notify/onboarding-complete', ...);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Onboarding completion failed');
  }
  password = data.password ?? null;
  email = data.email ?? '';
  isNew = data.isNewAccount ?? false;
} catch (e) {
  setCertifying(false);
  setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
  return; // don't call onComplete — let user retry
}
```

This way the student sees an error message and can retry, rather than being sent to a broken completion screen.

### Decision 4: Timeout on ALL Resend calls

Currently none of the `fetch()` calls have an `AbortController` timeout. A hung TCP connection to Resend could block the request indefinitely (Vercel has a 10s function timeout, but that's still a 10s hang). Adding a 5s timeout is defensive — email is not worth blocking the user that long.

## Risks / Trade-offs

- **Email silently lost**: If Resend is down, emails are not sent and only a console.error is logged. No retry, no queue. → Mitigation: The password is always in the API response payload, so the student can still log in. Admin notifications are FYI-only. This is acceptable for a v1 fix; a proper retry/queue system can be added later.
- **Shared utility couples all routes**: If `sendEmail()` changes signature, all 5 routes need updating. → Mitigation: The surface area is tiny (3 params + optional from). Unlikely to churn.
- **Timeout too aggressive**: 5 seconds might be too short for Resend under load. → Mitigation: Resend's API typically responds in <500ms. 5s is generous for a notification.

## Open Questions

- Should we add a `/api/cron/sweep` check for stranded auth users (users in `auth.users` with no corresponding student row completion)? Out of scope for this fix but worth flagging.
