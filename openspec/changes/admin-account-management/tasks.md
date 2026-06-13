## 1. Database

- [x] 1.1 Create `admin_accounts` table with RLS (admin-only read/write)
- [x] 1.2 Alter `preceptors` table — add `email`, `auth_user_id`, `notify_evaluation`, `notify_schedule_approved`
- [x] 1.3 Seed `rjb4200@gmail.com` into `admin_accounts` linked to existing auth user
- [x] 1.4 Set Supabase Auth JWT expiry to 1 year
- [x] 1.5 Regenerate TypeScript types

## 2. Account Management Page

- [x] 2.1 Create `/admin/accounts` page with filter tabs (Admin, Preceptors, Students)
- [x] 2.2 Build admin account list with create/edit/disable/delete
- [x] 2.3 Build preceptor account list with create/edit/disable/delete
- [x] 2.4 Build student account list with search and edit
- [x] 2.5 Build edit form for each account type (info fields, status toggles, notification preferences, password change)
- [x] 2.6 Handle query param `?edit=<id>` to open edit form
- [x] 2.7 Add back-to-list navigation from edit view

## 3. Admin Page Updates

- [x] 3.1 Add "Account Management" link to hamburger dropdown
- [x] 3.2 Update Student Roster — student names link to `/admin/accounts?edit=<id>`

## 4. Login & Middleware

- [x] 4.1 Update login page Admin tab — role-based redirect (admin → /admin, preceptor → /preceptor)
- [x] 4.2 Update middleware — allow preceptor role through /admin routes
- [x] 4.3 Create `/preceptor` coming-soon page

## 5. Notification Routes

- [x] 5.1 Update onboarding-complete route — query `admin_accounts` for recipients
- [x] 5.2 Update flagged-evaluation route — query `admin_accounts` for recipients
- [x] 5.3 Update evaluation-receipt route — add preceptor notification logic

## 6. Verification

- [x] 6.1 Verify admin can create/edit/disable/delete admin and preceptor accounts
- [x] 6.2 Verify admin can edit student info and status
- [x] 6.3 Verify notification routes send to correct recipients from database
- [x] 6.4 Verify preceptor can log in and sees coming-soon page
- [x] 6.5 Verify student roster names link to edit page
- [x] 6.6 Verify non-admin cannot access admin_accounts or admin panel
- [x] 6.7 Run production build and resolve any issues
