## Context

Three admin deletion paths share the same bug class: silent error swallowing on destructive operations. `daily-ops.tsx` passes `student.id` (database row UUID) to the auth deletion API instead of `student.auth_user_id` (Supabase Auth UUID). All three paths use empty `catch {}` blocks. The `students` table has no DELETE RLS policy. The `delete-auth-user` API route only handles auth user deletion and has no coupling to the student record.

## Goals / Non-Goals

**Goals:**
- Create a server-side delete-student route that handles both auth and record deletion atomically
- Fix the wrong-ID bug in daily-ops
- Replace all empty `catch {}` blocks with visible error feedback
- Add RLS DELETE policy for students

**Non-Goals:**
- Changing the archive/status flow (already works via dropdown)
- Refactoring email `catch {}` blocks (separate concern, addressed by safe-email-templates)
- Adding an archive button (feature, not bug fix)

## Decisions

### Decision 1: New combined API route over fixing callers individually

**Chosen**: Create `POST /api/admin/delete-student` that takes `studentId`, looks up the student, deletes the auth user if `auth_user_id` exists, then deletes the student record. Return `{ success: true }` or `{ error: string }`.

**Alternative**: Fix the wrong-ID bug in daily-ops and add error checking to the fetch call. Rejected — the route still does two separate operations (auth delete + DB delete) with no atomicity, and the caller is still responsible for orchestrating them.

**Rationale**: A single route centralizes the deletion logic, uses the service-role client (bypasses RLS), and can attempt rollback if the second step fails. The route is reusable by other admin tools in the future.

### Decision 2: Auth-first deletion with error recovery

Deletion order:
1. If `student.auth_user_id` exists, delete the auth user via admin client
2. Delete the student record (cascades delete messages, schedules, evaluations, etc.)
3. If auth deletion fails, abort — don't delete the student record (avoids orphan auth users)
4. If student deletion fails after auth deletion, attempt to recreate the auth user (best-effort rollback) and return an error

**Rationale**: This prevents the most common partial state (student record gone, auth user orphaned). Full atomicity isn't possible across Supabase Auth + database, but aborting on the first failure prevents the worst outcomes.

### Decision 3: Error display via state variable

Each component gets a new `error` or `deleteError` state variable. On failure, set the error message and display it in a red alert banner. On success, clear it and show a success message briefly.

### Decision 4: RLS DELETE policy

```sql
CREATE POLICY "Admins can delete students" ON students
  FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
```

Matches existing admin RLS pattern used across all other tables.

## Risks / Trade-offs

- **Auth recreation after failed DB delete is best-effort**: If the auth recreation fails, there's an orphan auth user. → Mitigation: log the failure prominently and include the orphaned auth user ID in the error message so the admin can manually clean up.
- **Existing client-side delete calls may still work**: The anon-key client in daily-ops won't be used for deletion anymore (the new route uses service-role), but the old code is removed. The RLS policy is defense-in-depth.
