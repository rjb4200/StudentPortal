## 1. Shared Email Utility

- [x] 1.1 Create `src/lib/email.ts` with `sendEmail()` function that wraps `fetch('https://api.resend.com/emails', ...)` with AbortController timeout (default 5s), returns `{ ok: boolean; error?: string }`, and logs structured errors on failure

## 2. Onboarding Completion — Split Critical Path from Email

- [x] 2.1 Refactor `src/app/api/notify/onboarding-complete/route.ts`: extract auth creation and DB linking into an inner try/catch that returns 500 on failure; move admin email and student email to separate top-level try/catch blocks that log and continue on failure
- [x] 2.2 Replace raw Resend `fetch()` calls with `sendEmail()` from the shared utility
- [x] 2.3 Ensure the API always returns `{ success: true, password, email, isNewAccount }` when auth creation succeeds, regardless of email outcome

## 3. Admin Approval — Guard Email Sending

- [x] 3.1 Wrap the Resend `fetch()` call in `src/app/api/admin/approve-student/route.ts` with try/catch so a network error does not crash the response after the DB update
- [x] 3.2 Replace raw Resend `fetch()` with `sendEmail()` from the shared utility

## 4. Schedule Cancel — Guard Both Emails

- [x] 4.1 Wrap the student notification `fetch()` call in `src/app/api/schedule/cancel/route.ts` with try/catch
- [x] 4.2 Wrap the admin notification `fetch()` call in the same route with try/catch (independent of the student email)
- [x] 4.3 Replace both raw Resend `fetch()` calls with `sendEmail()` from the shared utility

## 5. Admin Schedule Action — Guard Email

- [x] 5.1 Wrap the Resend `fetch()` call in `src/app/api/admin/schedule-action/route.ts` with try/catch
- [x] 5.2 Replace raw Resend `fetch()` with `sendEmail()` from the shared utility

## 6. Frontend Error Handling

- [x] 6.1 Replace the empty `catch {}` in `src/components/onboarding/knowledge-gate.tsx` `handleComplete` with proper error handling: set an error state and show a retry-able message instead of silently advancing to the completion screen with null credentials

## 7. Verification

- [x] 7.1 Run `npm run build` to verify no compilation errors
- [ ] 7.2 Manually verify: simulate Resend failure by temporarily setting RESEND_API_KEY to an invalid value in `.env.local`, run through onboarding, confirm auth user is created and temp password appears on completion screen
