## 1. Bug Fix

- [x] 1.1 Fix `certifying` state never reset in `KnowledgeGate` — add `setCertifying(false)` after `onComplete()`

## 2. Auth User Creation on Quiz Complete

- [x] 2.1 Update `api/notify/onboarding-complete/route.ts` to create auth user via service role if not exists
- [x] 2.2 Send magic link to student email via `supabase.auth.admin.generateLink()`
- [x] 2.3 Handle case where auth user already exists (re-registration), skip creation, still send magic link

## 3. Completion Screen

- [x] 3.1 Create `src/components/onboarding/onboarding-complete.tsx` — fetches `template_type = 'completion'` from `message_templates`, renders title + body, falls back to default text
- [x] 3.2 Add step 5 to `onboarding/page.tsx` — render `OnboardingComplete` component when `currentStep === 5`
- [x] 3.3 Wire KnowledgeGate's `onComplete` to set step to 5

## 4. Pending Dashboard

- [x] 4.1 Update middleware to allow `status === 'pending'` students through to `/dashboard`
- [x] 4.2 Add pending-approval UI to dashboard when status is pending (message + calendar link + hiding tabs)
- [x] 4.3 Show iCal feed link with copy button for pending students

## 5. Login Email Validation

- [x] 5.1 Before sending magic link, query `students` table for email
- [x] 5.2 If no student row found or status is `expired` or `is_blacklisted`, redirect to `/onboarding?token=WFD_TRAINING_2026`
- [x] 5.3 If student found and eligible, proceed with existing magic link flow

## 6. Admin Completion Message Editor

- [x] 6.1 Add Completion Message card to `/admin/setup` page (title, body, active toggle, save button)
- [x] 6.2 Fetch/upsert `message_templates` row with `template_type = 'completion'`

## 7. Database Seed

- [x] 7.1 Insert default completion message into `message_templates` with `template_type = 'completion'`

## 8. Verification

- [x] 8.1 Verify quiz completion → spinner stops → completion screen shown
- [x] 8.2 Verify auth user created and magic link sent on quiz completion
- [x] 8.3 Verify completion screen renders admin-configured text
- [x] 8.4 Verify pending student can log in via magic link and sees pending dashboard
- [x] 8.5 Verify unregistered email on login page redirects to onboarding
- [x] 8.6 Verify expired/blacklisted student is redirected from login
- [x] 8.7 Verify admin can edit completion message and changes appear for new students
- [x] 8.8 Run production build and resolve any issues
