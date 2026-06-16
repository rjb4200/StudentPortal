## 1. API

- [x] 1.1 Add `isNewAccount: boolean` to `POST /api/notify/onboarding-complete` response — true when `tempPassword` was generated, false when existing auth was linked

## 2. OnboardingComplete Component

- [x] 2.1 Add `isNewAccount` prop to `OnboardingCompleteProps` interface
- [x] 2.2 Implement new-account path: credentials box + prominent "Continue to Dashboard" button + secondary "Go to Login" link
- [x] 2.3 Implement existing-account path: info box ("Use your existing WFD credentials") + "Go to Login" button, no credentials box, no auto-login
- [x] 2.4 Implement "Continue to Dashboard" handler: store temp password in sessionStorage, call `supabase.auth.signInWithPassword()`, redirect to `/dashboard` on success, redirect to `/login` on failure
- [x] 2.5 Clear temp password from sessionStorage after successful sign-in

## 3. Props Plumbing

- [x] 3.1 Update `KnowledgeGate` — expand `onComplete` callback signature to `(password: string | null, email: string, isNewAccount: boolean)`, capture `isNewAccount` from API response, pass to parent
- [x] 3.2 Update `OnboardingPage` — add `isNewAccount` state, update `handleQuizComplete` to accept third parameter, pass `isNewAccount` to `OnboardingComplete`

## 4. Verification

- [x] 4.1 Run `npm run build` to verify no TypeScript or compilation errors
- [x] 4.2 Manual test: new student completes onboarding — verify "Continue to Dashboard" button appears and successfully auto-logs into dashboard
- [x] 4.3 Manual test: existing-account student completes onboarding — verify no credentials box or auto-login button, only "Go to Login" link
- [x] 4.4 Manual test: verify temp password is not exposed in URL at any point
