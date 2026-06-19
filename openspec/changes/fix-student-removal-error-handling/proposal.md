## Why

Three deletion paths in the admin panel — individual student delete, account delete, and bulk purge — all catch and silently swallow errors with empty `catch {}` blocks. The individual student delete additionally sends the wrong user ID (`student.id` instead of `student.auth_user_id`) to the auth deletion API. Admins receive zero feedback when a removal fails, and partial states (auth user deleted but student record remaining, or vice versa) are invisible. There is no RLS DELETE policy on the `students` table.

## What Changes

- Create `POST /api/admin/delete-student` — a server-side route that deletes the auth user (if linked) then the student record, returning clear success/error JSON
- Fix `daily-ops.tsx` `handleDeleteStudent`: call new route, correct the `userId` bug, display errors
- Fix `accounts/page.tsx` `deleteAccount`: add error handling for auth and DB deletion failures with user-visible messages
- Fix `maintenance-archive.tsx` `handlePurge`: display errors instead of silently setting `purgeDone` on failure
- Add RLS DELETE policy on `students` for admin role

## Capabilities

### New Capabilities
- `safe-student-removal`: Server-side transactional student deletion with visible error reporting; RLS-protected student row deletion

## Impact

- **New API route**: `src/app/api/admin/delete-student/route.ts`
- **Modified**: `src/components/admin/daily-ops.tsx`, `src/app/admin/accounts/page.tsx`, `src/components/admin/maintenance-archive.tsx`
- **New migration**: RLS DELETE policy on `students`
- **Zero breaking changes**: existing deletion flows replaced with proper error handling
