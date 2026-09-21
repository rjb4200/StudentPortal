## Context

The registration RPC creates a new pending student row for an expired, archived, or rejected email and retains the old row for audit history. On onboarding completion, the route reuses the existing Supabase Auth account for that email. The old terminal row remains linked through `auth_user_id`, so the new and old rows match the same auth user. Login, middleware, and the auth callback require a single matching row.

## Goals / Non-Goals

**Goals:**
- Ensure a renewed enrollment is the sole current student row linked to its reused Auth user.
- Preserve old terminal enrollment rows and their audit metadata.
- Keep the existing-credentials experience for renewed students.

**Non-Goals:**
- Delete expired, archived, or rejected student records.
- Change the required re-registration and full onboarding wizard.
- Create new credentials when an existing Auth user is valid.

## Decisions

### Detach terminal rows immediately before linking the renewed row

After resolving or creating the Auth user, the onboarding completion route clears `auth_user_id` from other expired, archived, or rejected student rows assigned to that user, then links the current pending enrollment row. This keeps exactly one queryable current row for the Auth user.

**Alternative considered:** Delete the expired Auth user during the sweep. Rejected because account deletion is unnecessary and would force renewed students to use new credentials rather than the existing-account flow already supported by onboarding completion.

## Risks / Trade-offs

- **A historical terminal record no longer contains the auth user id.** → The row remains linked to its successor through `previous_student_id` and retains all status and audit fields. The active account must resolve to one current enrollment.
