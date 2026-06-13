## Context

The onboarding quiz currently has a bug where the "Finish Onboarding" button spins forever. The `certifying` state in `KnowledgeGate` is set to `true` but never reset because `onComplete` is `() => {}` — an empty callback. Additionally, no auth user is created on quiz completion, so even after "completing" onboarding, a student cannot log in.

The current login page sends magic links to any email via Supabase Auth without checking if the student actually registered. Unregistered or expired students get a magic link that leads nowhere or to a broken state.

## Goals / Non-Goals

**Goals:**
- Fix the infinite spinner bug (1 line).
- Create the student's auth user and send a magic link when the quiz is completed.
- Add an admin-configurable completion screen (step 5) to the onboarding flow.
- Allow pending students with auth accounts to log in and see a pending-approval dashboard.
- Validate login emails against the `students` table before sending magic links.
- Add a Completion Message editor to the admin setup page.

**Non-Goals:**
- Changing the existing admin approval flow (`approveStudent` in auth.ts).
- Adding preceptor messaging for pending students (not being added at this time).
- Changing the onboarding step sequence (1-4 unchanged, step 5 added at end).

## Decisions

### 1. Auth user creation at quiz completion, not at admin approval

Currently, auth users are created when an admin clicks "Approve" in Daily Ops (`approveStudent` in `auth.ts`). This change moves auth user creation to quiz completion time. The admin approval step still updates `status = 'certified'` and `access_until` — it just no longer needs to create the auth user.

**Rationale:** Students need a magic link to log in after completing the quiz. The admin approval is a separate gate — it controls dashboard access level, not auth existence. Creating the auth user early also means the `students.id = auth.users.id` mapping happens at registration time rather than approval time, simplifying the approval flow.

**Alternative considered:** Keep admin approval as the auth creation point and send a "thanks, wait for approval email" instead of a magic link. This would mean students can't log in at all until approved — no pending dashboard, no calendar preview. The current design gives students immediate dashboard access (limited) which is better UX.

### 2. Completion message stored as `message_templates` row with `template_type = 'completion'`

Same pattern as the welcome message (`template_type = 'welcome'`). A single row with title, body, and `is_active` flag. The `OnboardingComplete` component fetches it by `template_type`.

**Rationale:** Reuses existing table. Admin setup page already has the Welcome Message editor — the Completion Message editor follows the same pattern.

### 3. Login email validation queries `students` table, not Supabase Auth

Before calling `supabase.auth.signInWithOtp()`, the login page queries `students` for the email to check `status` and `is_blacklisted`. If no row found, redirect to onboarding.

**Rationale:** The `students` table is the source of truth for who is a registered student. Supabase Auth may have users that aren't in `students` (e.g., manually created admin accounts). Querying `students` first ensures only registered students get magic links.

**Alternative considered:** Let Supabase Auth handle it and redirect based on auth errors. This would send magic links to anyone with an auth account, including admins using the student tab, and wouldn't provide a meaningful redirect for unrecognized emails. Supabase Auth's `signInWithOtp` succeeds silently for unknown emails (no error), so there's no way to distinguish "email not found" from "email sent" without a pre-check.

### 4. Pending dashboard: read-only calendar preview only

When `status === 'pending'`, the dashboard renders a pending message with the iCal feed link. The calendar grid, schedule request modal, preceptor gallery, evaluation form, and messaging tabs are not rendered.

**Rationale:** Pending students can't schedule shifts yet (that requires certified status). The iCal link is informational — it will be empty but the student can see how to subscribe.

### 5. Completion screen as step 5, not a modal or redirect

The onboarding progress bar shows steps 1-4, then step 5 appears as a standalone "Onboarding Submitted!" card. The progress indicator shows step 5 as completed without adding a 5th dot (to keep the 4-step indicator clean).

**Rationale:** The completion screen is logically "after" step 4 and shouldn't affect the 4-step progress visualization. Making it step 5 in state simplifies the component logic — no new UI patterns needed.

## Risks / Trade-offs

- **[Risk] Auth user created but admin never approves** → Mitigation: The `approveStudent` function in `auth.ts` already handles the case where an auth user already exists (it checks for "already been registered" error). No change needed.
- **[Risk] Student completes quiz, gets magic link, but email goes to spam** → Mitigation: The completion screen tells them to check their email. Supabase Auth emails are sent from `noreply@mail.app.supabase.io` by default (configurable with custom SMTP).
- **[Risk] Pending students could brute-force guess the dashboard URL of certified students** → Mitigation: RLS on `schedules`, `evaluations`, etc. already scopes to `auth.uid() = student_id`. Pending students can only see their own empty data.

## Migration Plan

1. Seed the `message_templates` completion row.
2. Update the notification API route to create auth user + send magic link.
3. Fix the `certifying` state reset in KnowledgeGate.
4. Create `OnboardingComplete` component.
5. Add step 5 to onboarding page.
6. Update middleware to allow pending students.
7. Update dashboard to show pending approval UI.
8. Update login page with email validation.
9. Add Completion Message editor to admin setup page.
10. Run build and verify.

Rollback: All changes are additive or small fixes. The spinner fix is trivial. Auth user creation at quiz time is new behavior that can be rolled back by reverting the API route change (admin approval would still create auth users as before). The completion screen, pending dashboard, and login validation are standalone additions.

## Open Questions

- None.
