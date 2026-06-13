## Why

The "Approve" button in the Student Approval Queue does nothing because `approveStudent()` in `src/lib/auth.ts` calls `createAdminClient()` which uses `SUPABASE_SERVICE_ROLE_KEY`. This is the last remaining instance of `createAdminClient()` being used in browser-side code. The previous two fixes addressed the same bug in the accounts page and the student delete function. This fix eliminates the final instance.

## What Changes

- Create `POST /api/admin/approve-student` route — server-side student approval using the service role key (creates auth user if not exists, updates student status to certified, sets access expiry, sends magic link).
- Update `handleApprove` in `daily-ops.tsx` to call the API route via `fetch()` instead of importing `approveStudent()` from `auth.ts`.
- Remove the `approveStudent` import from `daily-ops.tsx`.

## Capabilities

### New Capabilities
- `fix-approve-student-bug`: Server-side API route for student approval, fixing the non-functional Approve button.

### Modified Capabilities
*(None — this is a bug fix with no requirement-level behavior change.)*

## Impact

- New file: `src/app/api/admin/approve-student/route.ts`
- Modified: `src/components/admin/daily-ops.tsx` — replace `approveStudent()` call with `fetch()`, remove import.
- The `approveStudent` function in `src/lib/auth.ts` remains usable for server-side contexts.
