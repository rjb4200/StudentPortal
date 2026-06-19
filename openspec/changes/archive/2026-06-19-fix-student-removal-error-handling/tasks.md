## 1. Server-side Deletion Route

- [x] 1.1 Create `src/app/api/admin/delete-student/route.ts` — POST handler, admin auth, lookup student, delete auth user if linked, delete student record, error recovery with auth recreation attempt

## 2. RLS Policy

- [x] 2.1 Create `supabase/migrations/016_add_student_delete_policy.sql` — `CREATE POLICY "Admins can delete students" ON students FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');`
- [x] 2.2 Apply migration to live Supabase

## 3. Fix Admin Deletion UIs

- [x] 3.1 Fix `src/components/admin/daily-ops.tsx` `handleDeleteStudent` — call new `/api/admin/delete-student` route with `student.id`, remove old auth delete fetch, add error state and display, remove empty catches
- [x] 3.2 Fix `src/app/admin/accounts/page.tsx` `deleteAccount` — add error handling for auth deletion fetch (check response), wrap DB delete in try/catch with error display
- [x] 3.3 Fix `src/components/admin/maintenance-archive.tsx` `handlePurge` — remove empty catch, add error state and display, don't set purgeDone on failure

## 4. Verification

- [x] 4.1 Run `npm run build` to verify no TypeScript errors
- [x] 4.2 Run `npm run test` to verify all existing tests still pass
