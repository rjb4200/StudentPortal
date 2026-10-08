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

### D3: Create-or-adopt with explicit ownership resolution
**Decision:** Before creating, look up an existing auth user by email.
- none → create
- exists, unlinked, role matches account type → adopt (link)
- exists, linked, or role differs → return a structured conflict naming the owner; do not modify the existing user

**Why:** Turns the failure from "permanently blocked email" into "self-heals or asks a clear question." Mirrors the existing onboarding reuse pattern.

**Alternative considered:** Always fail on existing email and require manual DB cleanup. Rejected: that is exactly the current bug.

### D4: Never silently change an adopted user's role
**Decision:** Adoption links but does not overwrite an existing role; mismatched or owned emails produce a conflict requiring an explicit admin choice.

**Why:** Prevents a benign "add preceptor" from silently escalating a live student account to admin, and prevents clobbering an existing owner.

**Consequence:** An admin who genuinely wants to change a role uses an explicit promote/convert path (out of scope here; the conflict message tells them to use a different email or perform an explicit change).

### D5: Role as capability ceiling; student status as orthogonal enrollment
**Decision:** Keep `app_metadata.role` scalar, treat it as a ceiling (`student` < `preceptor` < `admin`, admin already supersets preceptor in `canAccessPreceptor`), and rely on the `students.auth_user_id` link for student access, which middleware and RLS already resolve independently of role.

**Why:** Every realistic combination (student+admin, student+preceptor, student+admin+preceptor) is already expressible. A roles array would require rewriting role reads in `roles.ts`, middleware, login routing, and ~20 RLS policies for no behavioral gain.

**Alternative considered:** `app_metadata.roles: string[]` with set membership checks. Rejected as high-churn, low-value.

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

- [Profile row left unlinked when auth step fails] → Treat unlinked profile rows as retryable in the conflict path; surface a clear error; the row is inert without `auth_user_id`.
- [Email lookup via `listUsers` is paginated and could miss a user at scale] → Use the admin API's email lookup or a paged scan; keep the sweep as backstop. Confirm the SDK's current email-lookup capability during implementation.
- [Compensation delete itself fails, leaving an orphan] → Orphan then self-heals on the next create (D3) and is caught by the sweep (D6). Never a permanent block.
- [Adoption could be abused to attach an unlinked user to the wrong profile] → Only unlinked, role-matching users are adoptable; mismatch returns a conflict.
- [Partial unique index on `auth_user_id` fails to create if duplicate links already exist] → Pre-check and de-duplicate existing data in the migration before adding the index.
- [Role-ceiling model means an admin always has preceptor access] → Accepted; this matches existing `canAccessPreceptor` semantics. Preceptor gallery membership remains data-driven from the `preceptors` table, not the role.

## Migration Plan

1. Ship the migration: pre-check/deduplicate `auth_user_id` links, add `students.auth_user_id` FK, add partial unique indexes. Rollback: drop the FK and indexes (non-destructive).
2. Ship the consolidated provisioning route and point `accounts/page.tsx` at it; keep `create-auth-user` behavior reachable only through the new route.
3. Run a one-time orphan audit query to enumerate and review existing orphans before enabling the sweep's clean mode.
4. Enable sweep reconciliation (detect first, then clean never-signed-in orphans), and add the System Health orphan metric.
5. Verify: create admin for an unlinked orphan email (adopt path), attempt duplicate role conflict, simulate mid-provision failure and confirm no orphan remains.

## Open Questions

- Whether the conflict response should offer a one-click "promote existing user" action now, or only direct the admin to a different email. Safe to defer; the specs require a conflict and do not require the one-click path.
