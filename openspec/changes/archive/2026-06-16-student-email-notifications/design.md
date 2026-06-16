## Context

The portal sends 4 emails today: onboarding credential (student), onboarding complete (admin), evaluation receipt (student), and flagged evaluation (admin). The onboarding credential email says "You will receive a confirmation email when approved" but no such email exists. Schedule approvals/rejections are done via a direct client-side `.update()` on `schedules` with no email. The `src/lib/email.ts` utility and `lib/auth.ts`'s `approveStudent()`/`getPendingStudents()` are dead code.

## Goals / Non-Goals

**Goals:**
- Send a WFD-branded email to students when their account is approved by an admin
- Send WFD-branded emails when a schedule is approved or rejected
- Fix the onboarding credential email to use `#A40104` (not `#B61C20`) for all crimson elements
- Remove dead code (`email.ts`, unused auth functions)

**Non-Goals:**
- Adding a reusable email template utility (each route constructs its own HTML for now)
- Changing the `message_templates` system
- Adding email for account expiration (cron sweep)
- Adding broadcast-to-email functionality

## Decisions

### Decision 1: Move schedule actions to a server API route

Replace the client-side `handleScheduleAction` (which calls `supabase.from('schedules').update({ status })` directly) with a new `POST /api/admin/schedule-action` route that both updates the schedule AND sends the email.

**Why**: Client-side Supabase calls can't access `serverEnv.RESEND_API_KEY`. The email must be sent server-side. A single route ensures atomicity — if the email fails, the status update still succeeds (the email is best-effort), but both happen in the same request lifecycle.

**Route contract:**
```
POST /api/admin/schedule-action
{ scheduleId: string, action: 'approved' | 'rejected' }
→ { success: true }
```

The route will:
1. Authenticate the calling admin (parse cookies, verify session, check role)
2. Look up the schedule to get `student_id`, `date`, `shift_type`
3. Look up the student to get `email`, `full_name`
4. Update `schedules.status` to the new value
5. Send the email via Resend
6. Return success

### Decision 2: Unified WFD email template

All four student emails (onboarding credential, account approved, schedule approved, schedule rejected) share the exact same HTML structure — WFD logo header, crimson band, charcoal border, body box, footer. Only the title, body text, and CTA button label/link differ.

**Why**: Brand consistency. Each email looks like it comes from the same portal. The template structure from the onboarding credential email is proven and already tested with email clients.

**Template constants:**
- Header background: `#A40104`
- Header bottom border: `6px solid #1C1C1E`
- Logo: `https://ejjsahtohaydoogtilgp.supabase.co/storage/v1/object/public/branding/wfd-logo-1848.jpg`
- CTA button: `#A40104`, `border-radius: 10px`, `border: 1px solid #8a1518`
- Card: white, `border-radius: 16px`, `box-shadow: 0 10px 30px rgba(0,0,0,0.10)`
- Body text: `#4b5563`
- Footer text: `#6b7280` / `#9ca3af`
- Font: `Arial, Helvetica, sans-serif`

**Email `from` addresses:**
- Account-related: `onboarding@winchesterfireems.com`
- Schedule-related: `noreply@winchesterfireems.com`
- Evaluation-related: `noreply@winchesterfireems.com`

### Decision 3: Delete dead code

Remove `src/lib/email.ts` entirely and strip unused exports from `src/lib/auth.ts`.

**Why**: `email.ts` has never been imported. The `schedule-approved` and `schedule-rejected` templates it defined were placeholders. `approveStudent()` and `getPendingStudents()` in `auth.ts` are superseded by the API routes and have zero callers. Dead code causes confusion and maintenance burden.

### Decision 4: Onboarding email crimson fix

The existing onboarding credential email has its CTA button and inline color references using `#B61C20`. Change all of them to `#A40104` to match the header background.

**Why**: The portal uses two crimsons — Tailwind config has `crimson: '#A40104'` and wfd-crimson `#B61C20` is referenced in AGENTS.md. The email header already uses `#A40104` and the user confirmed this is correct. Consistency within the email template matters more than matching a specific Tailwind token.

## Risks / Trade-offs

- **[Risk] Schedule action route adds latency** → A direct client-side update was instant. Now there's a server round-trip + Resend API call. Mitigation: The UI already handles loading states. The email send is non-blocking for the response — the route returns success as soon as the DB update completes.
- **[Risk] Resend failures don't roll back the DB update** → If the Resend API fails, the schedule status is already updated but no email is sent. Mitigation: This is acceptable — the schedule status is the source of truth. Email delivery is best-effort. The Resend error is logged to Vercel for monitoring.
