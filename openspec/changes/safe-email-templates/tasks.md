## 1. Core Utilities

- [x] 1.1 Add `escHtml(value: string): string` to `src/lib/email.ts` — escapes `&`, `<`, `>`, `"`, `'`
- [x] 1.2 Add optional `ctaText?: string` parameter to `buildEmailHtml()` in `src/lib/email.ts` — applies `escHtml()` to the button label, defaults to "View Your Dashboard"
- [x] 1.3 Add unit tests for `escHtml()` covering: special characters, empty string, already-escaped text, normal text, Unicode characters

## 2. Template Module

- [x] 2.1 Create `src/lib/email-templates.ts` with `EmailContent` type (`{ subject: string; html: string }`) and imports for `escHtml`, `buildEmailHtml`
- [x] 2.2 Implement `buildStudentApprovalEmail({ full_name, login_url })` — approval email with "Go to Student Portal Login" CTA
- [x] 2.3 Implement `buildOnboardingCompleteStudentEmail({ email, temp_password, login_url })` — registration complete email with conditional password display
- [x] 2.4 Implement `buildOnboardingCompleteAdminEmail({ full_name, email, school_name })` — admin alert for new onboarding completion
- [x] 2.5 Implement `buildShiftCancelledByStudentEmail({ full_name, date_str, time_display, note })` — student confirmation of self-cancellation
- [x] 2.6 Implement `buildShiftCancelledByStudentAdminEmail({ full_name, date_str, time_display, note })` — admin notification of student cancellation
- [x] 2.7 Implement `buildShiftApprovedEmail({ full_name, date_str, time_display })` — shift approval notification
- [x] 2.8 Implement `buildShiftCancelledByAdminEmail({ full_name, date_str, time_display, note })` — admin-initiated cancellation notification
- [x] 2.9 Implement `buildShiftRejectedEmail({ full_name, date_str, time_display })` — shift rejection notification
- [x] 2.10 Implement `buildEvaluationReceiptEmail({ full_name })` — evaluation submission receipt
- [x] 2.11 Implement `buildFlaggedEvaluationEmail({ student_name, preceptor_name, overall_rating })` — admin alert for low-rated evaluation
- [x] 2.12 Add unit tests for each template function injecting special characters (`O'Brien <x>`, `School "A" & B`, `<script>alert(1)</script>`) and verifying output contains escaped equivalents with no raw special chars

## 3. Route Refactoring

- [x] 3.1 Refactor `src/app/api/admin/approve-student/route.ts` — replace ~60 lines of inline HTML with `buildStudentApprovalEmail()` call
- [x] 3.2 Refactor `src/app/api/notify/onboarding-complete/route.ts` — replace ~70 lines of inline HTML with `buildOnboardingCompleteStudentEmail()` and `buildOnboardingCompleteAdminEmail()` calls
- [x] 3.3 Refactor `src/app/api/schedule/cancel/route.ts` — replace ~50 lines of inline HTML with `buildShiftCancelledByStudentEmail()` and `buildShiftCancelledByStudentAdminEmail()` calls
- [x] 3.4 Refactor `src/app/api/admin/schedule-action/route.ts` — replace ~50 lines of inline HTML with calls to `buildShiftApprovedEmail()`, `buildShiftCancelledByAdminEmail()`, or `buildShiftRejectedEmail()` based on action
- [x] 3.5 Refactor `src/app/api/notify/evaluation-receipt/route.ts` — replace ~10 lines of inline HTML with `buildEvaluationReceiptEmail()` call
- [x] 3.6 Refactor `src/app/api/notify/flagged-evaluation/route.ts` — replace ~15 lines of inline HTML with `buildFlaggedEvaluationEmail()` call

## 4. Verification

- [x] 4.1 Run `npm run build` — verify no TypeScript errors and successful compilation
- [x] 4.2 Manual review: compare rendered email HTML output for each template against the pre-refactor output to confirm visual consistency with normal data
