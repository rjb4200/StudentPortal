## Context

The `admin-account-management` change moved auth user operations to API routes for the accounts page. The `fix-accounts-admin-client-bug` change also fixed the student delete function. The Student Approval Queue's Approve button is the last remaining browser-side call to `createAdminClient()`. It has the same root cause: `SUPABASE_SERVICE_ROLE_KEY` is `undefined` in the browser.

## Goals / Non-Goals

**Goals:**
- Fix the non-functional Approve button in the Student Approval Queue.
- Move student approval to a server-side API route.
- Remove all remaining browser-side `createAdminClient()` usage.

**Non-Goals:**
- Changing the approval logic (same behavior: create auth user if needed, certify student, send magic link).
- Modifying the `approveStudent` function in `auth.ts` (it may be used server-side in the future).
- Changing the Student Approval Queue UI.

## Decisions

### 1. Single approve route: `POST /api/admin/approve-student`

One route that handles the entire approval flow. Accepts `{ studentId }`. The route internally:
1. Queries student email from `students` table
2. Checks if auth user exists; creates one if not
3. Updates student status to `certified` with 120-day `access_until`
4. Sends magic link
5. Returns `{ success: true }`

**Rationale:** Self-contained. No need to split create-user/update-student into separate calls since approval is a single logical operation.

### 2. Route protected by admin-only check

The route verifies the caller's auth session has `user_metadata.role = 'admin'` before executing the service-role operation. Same pattern as the other `/api/admin/*` routes.

## Risks / Trade-offs

- **[Risk] Route does something already handled by onboarding-completion** → Mitigation: The `approveStudent` function in `auth.ts` already handles the "already been registered" case. The API route uses the same pattern — if auth user exists, skip creation.
- **[Risk] Double approval** → Mitigation: The route checks if the student is still `pending` before approving. If already certified, returns without changes.

## Migration Plan

1. Create `POST /api/admin/approve-student` route.
2. Update `handleApprove` in `daily-ops.tsx` to call the API route.
3. Remove `approveStudent` import from `daily-ops.tsx`.
4. Run build and verify.

Rollback: Revert `daily-ops.tsx` to import `approveStudent` and remove the API route.
