## Context

Preceptor accounts are created through Admin → Accounts → Add Preceptor, which posts to `POST /api/admin/provision-account`. That flow always provisions a Supabase Auth user (role `preceptor`) and links it to a `preceptors` row. The `preceptors` table already allows `email` and `auth_user_id` to be null, so a login-less roster entry is representable — only the creation flow insists on a login.

## Goals / Non-Goals

**Goals:**
- Let an admin create a preceptor with no email/password; store a `preceptors` row with `auth_user_id = null` and `email = null`.
- Keep the existing login flow (email + password) unchanged for preceptors and admins.
- Reject the half-configured case (email XOR password).

**Non-Goals:**
- Adding a login to an existing login-less preceptor later.
- Emailing login-less preceptors (evaluation/schedule notifications key off `preceptors.email`).
- Changing student or admin account creation.

## Decisions

**1. Optional fields, decided at the API boundary.**
The preceptor variant of `provisionAccountBody` makes `email` and `password` optional. The route computes `hasLogin = email && password`. Either both are present (existing atomic provisioning path) or neither (profile-only insert). A half-configuration returns 400. This keeps the branching in one place and leaves the admin variant untouched.

**2. Profile-only insert short-circuits before any auth handling.**
When there is no login, the route inserts the `preceptors` row (`auth_user_id: null`, `email: null`) and returns immediately, so none of the email-uniqueness, role-conflict, or auth-user code runs. Alternative rejected: reuse the full path with a null email (the uniqueness/owner lookups assume an email).

**3. Editing stays a plain profile edit.**
Existing edit of a preceptor already updates the row directly and only touches the auth user when a new password is supplied; that call is guarded to run only when `auth_user_id` exists, so a login-less preceptor edits cleanly.

**4. Uniqueness is not enforced across login-less preceptors.**
With no email there is no natural key; duplicates are allowed (as with any name-only roster entry). Acceptable for v1.

## Risks / Trade-offs

- **Silent no-email preceptors** → a login-less, emailless preceptor receives no notification emails; the form should make the optionality obvious so it's a deliberate choice.
- **No dedup** → two login-less preceptors with the same name can exist; the admin manages the list.
- **Later login** → converting a login-less preceptor to a login isn't supported yet; the admin would recreate it with an email.

## Migration Plan

No database change (columns already nullable). Ship validation + route + form together; rollback is code-only.
