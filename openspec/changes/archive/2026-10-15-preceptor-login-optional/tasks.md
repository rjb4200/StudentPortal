## 1. Validation

- [x] 1.1 Make `email` and `password` optional in the preceptor variant of `provisionAccountBody`, keeping them required for the admin variant

## 2. API

- [x] 2.1 In `POST /api/admin/provision-account`, compute whether a login is requested (email AND password) and reject the half-configured case for preceptors
- [x] 2.2 When no login is requested for a preceptor, insert the `preceptors` row with `auth_user_id = null` and `email = null` and return without any auth-user handling
- [x] 2.3 Keep the existing atomic login flow unchanged when email and password are provided

## 3. Admin UI

- [x] 3.1 In Accounts → Preceptors, label Email and Password as optional and stop requiring email/password on save
- [x] 3.2 Send no email/password for a new login-less preceptor, and guard the password-update call to preceptors that have an auth user

## 4. Verification

- [x] 4.1 Add a provision-account test: creating a preceptor with no email/password inserts a row and creates no auth user
- [x] 4.2 Add a provision-account test: email without password (and password without email) is rejected
- [x] 4.3 Run `npm run test` and `npm run build`
- [x] 4.4 Run `openspec validate preceptor-login-optional --strict`
