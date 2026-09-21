## 1. Re-enrollment Auth Linking

- [x] 1.1 Clear terminal prior student rows' `auth_user_id` before linking a reused Auth user to the renewed pending enrollment.
- [x] 1.2 Preserve the existing-account behavior: no new password is generated when the Auth user already exists.

## 2. Regression Coverage

- [x] 2.1 Extend onboarding completion route tests to verify terminal prior rows are detached before the current enrollment is linked.

## 3. Verification

- [x] 3.1 Run `npm run build`.
- [x] 3.2 Run `npm run test`.
