## 1. API Routes

- [x] 1.1 Create `POST /api/admin/create-auth-user` route
- [x] 1.2 Create `PUT /api/admin/update-auth-user` route
- [x] 1.3 Create `DELETE /api/admin/delete-auth-user` route

## 2. Accounts Page Fix

- [x] 2.1 Replace `createAdminClient()` in `saveEdit` with `fetch()` to API routes
- [x] 2.2 Replace `createAdminClient()` in `deleteAccount` with `fetch()` to API routes
- [x] 2.3 Remove `createAdminClient` import

## 3. Verification

- [x] 3.1 Verify Save button completes without spinning forever when creating/editing admin accounts
- [x] 3.2 Verify Save button completes without spinning forever when creating/editing preceptor accounts
- [x] 3.3 Verify Delete button works for admin and preceptor accounts
- [x] 3.4 Verify non-admin requests to API routes return 403
- [x] 3.5 Run production build and resolve any issues
