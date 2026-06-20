## 1. Configuration

- [x] 1.1 Add a validated canonical public app URL environment value.
- [x] 1.2 Document the app URL environment variable and required Supabase Auth URL settings.

## 2. Auth Link Generation

- [x] 2.1 Update password reset redirects to use the canonical app URL plus `/reset-password`.
- [x] 2.2 Update onboarding completion and account approval email links to use canonical `/login` URLs.
- [x] 2.3 Update schedule notification email links to use canonical `/dashboard` URLs.

## 3. Verification

- [x] 3.1 Run the relevant unit tests.
- [x] 3.2 Run `npm run build`.
