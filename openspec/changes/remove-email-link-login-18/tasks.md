## 1. Code Cleanup

- [x] 1.1 Remove `signInWithOtp` call from `src/lib/auth.ts` "already registered" branch (line 29-32)
- [x] 1.2 Remove `signInWithOtp` call from `src/lib/auth.ts` new-user success branch (line 50-53)
- [x] 1.3 Run `npm run build` to verify no compilation errors

## 2. Spec Updates — authentication-authorization

- [x] 2.1 Apply MODIFIED delta: replace "Admin-gated account creation with magic links" with "Admin-gated account creation with temp passwords"
- [x] 2.2 Apply MODIFIED delta: replace "Magic link authentication for students" with "Password-based authentication for students"

## 3. Spec Updates — onboarding-completion-flow

- [x] 3.1 Apply MODIFIED delta: replace "Quiz completion sends auth magic link" with "Quiz completion creates auth user with temp password"
- [x] 3.2 Apply MODIFIED delta: update "Admin-configurable completion screen" to describe temp password display
- [x] 3.3 Apply MODIFIED delta: update "Pending student dashboard access" to reference password login
- [x] 3.4 Apply MODIFIED delta: update "Login email validation" to reference password-based sign-in

## 4. Spec Updates — notifications-alerts

- [x] 4.1 Apply MODIFIED delta: remove parenthetical magic link note from "Resend transactional emails" requirement
- [x] 4.2 Apply REMOVED delta: remove "Account approval and magic link email" scenario

## 5. Spec Updates — fix-magic-link-redirects

- [x] 5.1 Apply REMOVED delta: remove entire spec (all three requirements)

## 6. Spec Updates — fix-approve-student-bug

- [x] 6.1 Apply MODIFIED delta: remove magic link references from "Server-side student approval" requirement

## 7. Verification

- [x] 7.1 Run `npm run build` to confirm no build errors
- [x] 7.2 Search codebase for `signInWithOtp` — should return zero results
- [x] 7.3 Search `openspec/specs/` for `magic.link` (case-insensitive) — should return zero active references (password-auth-system removal note exempt)
- [x] 7.4 Search `openspec/specs/` for `OTP` (case-insensitive) — should return zero active references
