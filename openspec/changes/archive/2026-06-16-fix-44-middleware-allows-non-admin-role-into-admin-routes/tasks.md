## 1. Shared Role Authorization

- [x] 1.1 Add a small shared role helper for `isAdmin`, `isPreceptor`, `canAccessAdmin`, and `canAccessPreceptor` semantics.
- [x] 1.2 Update middleware to use the helper and restrict `/admin` plus `/admin/*` to admin users only.
- [x] 1.3 Ensure middleware or page guards keep `/preceptor` accessible to admin and preceptor users.

## 2. Route And API Consistency

- [x] 2.1 Update admin page guards to use the shared helper where practical.
- [x] 2.2 Update the Preceptor page guard to use the shared helper and continue allowing admin access.
- [x] 2.3 Update `/api/admin/*` route authorization checks to use the shared admin helper without allowing non-admin roles.
- [x] 2.4 Review login redirect behavior so admins go to `/admin`, preceptors go to `/preceptor`, and other roles do not land in `/admin`.

## 3. Verification

- [x] 3.1 Verify preceptor users cannot access `/admin` or `/admin/*` through middleware.
- [x] 3.2 Verify admin users can access `/admin` and `/preceptor`.
- [x] 3.3 Verify non-admin users cannot call `/api/admin/*` actions.
- [x] 3.4 Run `npm run build`.
