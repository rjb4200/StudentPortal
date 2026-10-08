## Context

See `proposal.md` for motivation. Current state that shapes this design:

- Provisioning is two steps across two systems: `POST /api/admin/create-auth-user` calls `auth.admin.createUser`, then the browser (`src/app/admin/accounts/page.tsx:121-195`) inserts the `admin_accounts` / `preceptors` row. The browser owns step 2, so any navigation or error between them orphans the auth user.
- `create-auth-user` has no reverse lookup: it always creates, so an existing email fails with GoTrue's already-registered error and permanently blocks that email.
- `onboarding-complete` already implements the reuse pattern (`listUsers` → find by email → reuse), so create-or-adopt is consistent with existing behavior.
- `admin_accounts.email` is UNIQUE; `preceptors.email` is not. `admin_accounts` and `preceptors` have `auth_user_id` FK to `auth.users(id) ON DELETE SET NULL`; `students` does not.
- Deletion already depends on link state: `deleteAccount` deletes the auth user only when `row.auth_user_id` is set (`accounts/page.tsx:233`), which is one way an orphan is left behind.
- The daily sweep (`src/app/api/cron/sweep/route.ts`) already records runs to `system_job_runs` and writes `audit_log`, and System Health already summarizes that job — a natural host for reconciliation.

## Goals / Non-Goals

**Goals:**
- Eliminate the orphaned-auth-user failure mode for admin and preceptor provisioning.
- Make provisioning idempotent so a pre-existing orphan self-heals instead of blocking.
- Define the role model so "student and staff at once" is explicitly supported without a roles array.
- Detect and reconcile orphans as defense in depth.

**Non-Goals:**
- Changing login, middleware gating, or existing RLS semantics.
- Introducing a multi-value role set (`app_metadata.roles`). The ceiling + orthogonal-enrollment model covers all realistic combinations.
- Changing the student onboarding/reuse flow, which already works.
- Provisioning auth users from SQL (see Decisions: non-option).

## Decisions

### D1: Insert the profile row before creating the auth user
**Decision:** Create the `admin_accounts`/`preceptors` row first with `auth_user_id = null`, then provision/link the auth user, then update the link.

**Why:** The email is the globally-scarce resource. Creating it last means an interruption leaves a recoverable profile row (or a soft duplicate-email error) rather than an invisible reserved email. `admin_accounts.email` UNIQUE also gives an early, honest duplicate error before touching auth.

**Alternative considered:** Keep auth-first and add a compensating delete. Rejected as the primary order because the compensating window then spans a browser navigation; profile-first removes the window even before compensation is added.

**Consequence:** A failed auth step leaves a profile row with `auth_user_id = null`. This is inert (no login) and must be visible/retryable; the conflict handling below treats an unlinked profile row as retryable.

### D2: One server route owns both steps, with compensation
**Decision:** Replace the split flow with a single server endpoint (account provisioning) that inserts the profile row, creates-or-adopts the auth user, links it, and — on failure after creating an auth user — deletes only the auth user it created in that request.

**Why:** The server holds the exact id it created, so compensation cannot touch a pre-existing user. Moving step 2 off the browser removes the navigation/crash window entirely.

**Alternative considered:** Client-side insert with a `delete-auth-user` call on failure. Rejected: unreliable, and the browser may be gone before cleanup runs.

### D3: Replace unlinked staff logins (delete + recreate)
**Decision:** When an email already has an unlinked staff login, delete it and create a fresh login with the requested role and password, then link the new profile row. Do not adopt it.
- none → create
- exists, unlinked staff → replace (delete + recreate)
- exists, linked staff of a different role → change role in place, with confirmation
- exists, linked student, or a student record for the email → refuse (separate families)

**Why:** Recreating makes the requested role and password apply cleanly and avoids carrying an unknown password or stale metadata. The previous adopt path could not set a password, which silently broke login for the newly created account.

**Alternative considered:** Adopt + `updateUserById(role, password)` (no delete/create gap). Rejected in favor of delete + recreate per the "orphan cleanup" decision; the gap only exists for an already-abandoned, never-signed-in login, and the sweep/health surface it if recreation fails.

### D4: Staff role changes require explicit confirmation
**Decision:** A role change within the staff family (preceptor ↔ admin) is permitted only when the request carries an explicit confirmation. A cross-family change (student ↔ staff) is always refused.

**Why:** Keeps the "no silent escalation" guarantee while allowing the deliberate preceptor → admin escalation the user asked for.

**Consequence:** The UI shows a confirmation dialog when the server reports an existing staff login whose role differs from the requested one; the request is not applied until confirmed.

### D5: Student and staff accounts are separate families
**Decision:** A single email backs exactly one account family. A person who is both a student and staff uses distinct emails. Student access stays resolved by the `students` row whose `auth_user_id` matches; onboarding auth reuse is restricted to `role = 'student'` logins; staff provisioning refuses emails used by a student record.

**Why:** Matches the product rule that students and staff are kept separate, and avoids a single login holding both a student enrollment and a staff role.

**Alternative considered:** One auth user holding both (orthogonal enrollment). Rejected: contradicts the separation rule.

### D6: Reconciliation sweep plus health metric
**Decision:** Extend the daily sweep to detect orphans (no matching profile by `auth_user_id` or email) and, when configured to clean, delete only never-signed-in orphans, recording counts to the run summary. Surface an orphan count on System Health.

**Why:** Defense in depth. Even if D1–D4 slip, orphans are bounded in lifetime and visible.

**Guard:** Only never-signed-in, unlinked users are eligible for deletion; linked users are never removed.

### D7: DB integrity hardening
**Decision:** Add `students.auth_user_id` FK to `auth.users(id) ON DELETE SET NULL`, and partial unique indexes on `auth_user_id` per profile table (`where auth_user_id is not null`).

**Why:** Matches existing FKs on `admin_accounts`/`preceptors`, prevents two profiles sharing one auth user within a table, and makes deleting an auth user cleanly null links.

### Non-option: SQL-level atomic provisioning
**Considered:** Insert directly into `auth.users`/`auth.identities` inside a `SECURITY DEFINER` function to get a true transaction (the repo has precedent touching `auth.users` in migrations).

**Rejected:** Bypasses GoTrue password hashing, identity rows, and hooks; unsupported and fragile. Compensating cleanup in application code is the correct tool.

## Risks / Trade-offs

- [Profile row left unlinked when the auth step fails] → Treat unlinked profile rows as retryable; surface a clear error; the row is inert without `auth_user_id`.
- [Email lookup via `listUsers` is paginated and could miss a user at scale] → Page through `listUsers`; keep the sweep as backstop.
- [Delete-then-recreate leaves a gap if recreation fails] → The deleted login is an abandoned, never-signed-in orphan; on failure, report it and let the sweep/health surface it. Linked logins are never deleted — their role is changed in place.
- [Cross-family misclassification] → Determine family from both the profile tables (by email) and the login's role; refuse whenever a student record or student login is involved.
- [Partial unique index on `auth_user_id` fails if duplicate links already exist] → Pre-check and de-duplicate in the migration.
- [Staff role change applied without confirmation] → The route refuses a staff role change unless the request carries an explicit confirmation flag.

## Migration Plan

1. Ship the migration: pre-check/deduplicate `auth_user_id` links, add `students.auth_user_id` FK, add partial unique indexes. Rollback: drop the FK and indexes (non-destructive).
2. Ship the consolidated provisioning route and point `accounts/page.tsx` at it; keep `create-auth-user` behavior reachable only through the new route.
3. Run a one-time orphan audit query to enumerate and review existing orphans before enabling the sweep's clean mode.
4. Enable sweep reconciliation (detect first, then clean never-signed-in orphans), and add the System Health orphan metric.
5. Verify: create an admin for an unlinked preceptor orphan (replace + escalation confirm), attempt a cross-family refusal, simulate a mid-provision failure and confirm no orphan remains.

## Open Questions

- Whether a **linked** staff account of a different role should be converted in place or require a separate email. Current design: in-place role change with confirmation; revisit if it causes confusion.
- Whether the onboarding-completion refusal for a staff email should offer a "use a different email" retry inline or just instruct the student.
