## 1. Database

- [x] 1.1 Add `notify_schedule_requested` column to `admin_accounts` (boolean, default `true`) via migration file in `supabase/migrations/`
- [x] 1.2 Apply the migration live against the Supabase project via SQL editor
- [x] 1.3 Run `supabase_generate_typescript_types` to update `src/lib/supabase/database.types.ts`

## 2. Email Template

- [x] 2.1 Add `buildShiftRequestedAdminEmail` to `src/lib/email-templates.ts` following the same layout as `buildShiftCancelledByStudentAdminEmail` with student name, date, shift type, and time range

## 3. API Route

- [x] 3.1 Update `src/app/api/schedule/request/route.ts` to query active admins with `notify_schedule_requested = true` after a successful schedule insert, then send the admin notification email using the new template
- [x] 3.2 Wrap email delivery in try/catch so schedule insert succeeds regardless of email outcome, logging failures

## 4. Admin UI

- [x] 4.1 Add `notify_schedule_requested` to the admin account form initial state and save payload in `src/app/admin/accounts/page.tsx`
- [x] 4.2 Add the "Shift request alerts" checkbox to the admin notification preferences section in the account form

## 5. Verification

- [x] 5.1 Run `npm run build` to verify no compilation errors
- [x] 5.2 Run `npm run test` to verify existing tests pass
- [x] 5.3 Manually test: submit a shift request as a student, verify admin with toggle enabled receives email
