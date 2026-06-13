## Why

The onboarding quiz completion flow has three issues: a spinner that spins forever because `certifying` state is never reset and the `onComplete` callback is empty, no auth user is created on quiz completion so students can't log in, and the login page sends magic links to any email regardless of whether the student has registered. Students need a smooth handoff from quiz completion → magic link login → pending approval dashboard → approved access.

## What Changes

- Fix the infinite spinner bug in `KnowledgeGate` by resetting `certifying` state after completion.
- Add a step 5 "Onboarding Submitted" completion screen to the onboarding flow with an admin-configurable enthusiastic message fetched from database.
- Create the student's auth user and send a magic link email immediately when the quiz is completed (via the existing notification API route).
- Allow `pending` status students to access their dashboard, showing a pending-approval screen with calendar link instructions.
- Validate student email against the `students` table on the login page before sending a magic link; redirect unrecognized, expired, or blacklisted emails to the onboarding page.
- Add a Completion Message editor to the admin setup page (`message_templates` row with `template_type = 'completion'`).

## Capabilities

### New Capabilities
- `onboarding-completion-flow`: End-to-end onboarding completion experience including auth user creation on quiz finish, magic link delivery, admin-configurable completion screen, pending-approval dashboard, and login email validation.

### Modified Capabilities
*(None — all existing behavior is preserved; pending students simply gain dashboard access with a limited view.)*

## Impact

- Modified: `src/components/onboarding/knowledge-gate.tsx` (1-line fix)
- New: `src/components/onboarding/onboarding-complete.tsx`
- Modified: `src/app/onboarding/page.tsx` (step 5 + real callback)
- Modified: `src/app/api/notify/onboarding-complete/route.ts` (auth user creation + magic link)
- Modified: `src/middleware.ts` (allow pending students through)
- Modified: `src/app/dashboard/page.tsx` (pending approval UI)
- Modified: `src/app/login/page.tsx` (email validation before magic link)
- Modified: `src/app/admin/setup/page.tsx` (completion message editor)
- Database: seed `message_templates` row with `template_type = 'completion'`
