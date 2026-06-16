## 1. Fix onboarding email crimson color

- [x] 1.1 Replace all `#B61C20` references in `src/app/api/notify/onboarding-complete/route.ts` with `#A40104` (CTA button text, border, box-shadow)

## 2. Account approved email

- [x] 2.1 Add email-sending logic to `src/app/api/admin/approve-student/route.ts` after the status update — use the shared WFD template with title "Account Approved", body "Your account has been approved", and CTA "Go to Student Portal Login" → `/login`

## 3. Schedule action API route

- [x] 3.1 Create `src/app/api/admin/schedule-action/route.ts` with POST handler that authenticates the admin, looks up schedule + student, updates schedule status, and sends the appropriate email
- [x] 3.2 Update `src/components/admin/daily-ops.tsx` to call `POST /api/admin/schedule-action` instead of doing a direct client-side `supabase.from('schedules').update()`

## 4. Cleanup dead code

- [x] 4.1 Delete `src/lib/email.ts`
- [x] 4.2 Remove unused `approveStudent()` and `getPendingStudents()` from `src/lib/auth.ts`

## 5. Verification

- [x] 5.1 Run `npm run build` and confirm zero errors
