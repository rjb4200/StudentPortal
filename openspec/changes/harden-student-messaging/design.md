## Context

The student dashboard renders Messages for pending and certified students, but the live `messages` insert policy requires `status = 'certified'`. Browser-side inserts discard the database error, which produces an apparent no-op. Admin replies and broadcasts also write directly from the browser. No message-specific notification preference, email template, or deep link exists.

The existing account notification model already selects active admins through per-account boolean preferences and sends email through the server-side Resend client. The messaging change should extend that pattern without adding inbound email processing.

## Goals / Non-Goals

**Goals:**
- Make pending and certified, non-blacklisted students able to send messages reliably.
- Persist messages before attempting email delivery and expose send failures to the actor.
- Notify all active admins who opt in, with a deep link to the relevant Daily Operations thread.
- Keep each student conversation private to that student and administrators.
- Correct `.ics` route parsing so displayed subscription URLs work.

**Non-Goals:**
- Receiving or parsing replies sent directly to an email inbox.
- Realtime chat, typing indicators, message reactions, attachments, or preceptor messaging.
- Changing student messages into a ticket-assignment or multi-department workflow.

## Decisions

### Server-backed message mutations

Student sends and admin replies use authenticated API routes backed by the service-role client. The routes resolve the student record from the authenticated user, validate trimmed content and a bounded length, write the message, then return the persisted row. The client never chooses an arbitrary student identity for student-originated messages.

Direct browser writes were rejected because they silently hide RLS failures and cannot safely invoke Resend. RLS remains enabled as a defense-in-depth ownership boundary for direct reads and accidental writes.

### Pending and certified student access

Authenticated students with an enrollment matching `auth.uid()`, a status of `pending` or `certified`, and `is_blacklisted = false` can create their own messages. Expired, archived, and blacklisted students cannot create messages. This matches the dashboard's intended pending-student access to Messages.

Restricting messaging to certified students was rejected because it prevents students from contacting staff while awaiting account approval.

### Opt-in admin email notifications

Add `admin_accounts.notify_student_messages`, defaulting to true. After persisting a student message, the server selects active admins with this setting enabled and sends them one notification email each. Email failure is logged and does not change the successful portal message response.

All opted-in admins receive the alert rather than selecting a primary recipient. This follows the existing onboarding and evaluation notification model and avoids a single point of operational failure.

### Deep-link reply workflow

The notification email contains an `Open conversation` link to `/admin?tab=daily&student=<student-id>`. Daily Operations reads that query parameter after loading the roster and selects the corresponding thread. Admins reply in the authenticated portal, not through inbound email.

`mailto:` and inbound email replies were rejected because they cannot preserve the authenticated thread or reliably associate a reply without a verified inbound-email webhook and reply-token system.

### Calendar feed suffix parsing

The personal calendar route strips the `.ics` suffix from its dynamic route parameter before using it as the UUID database key. This preserves the subscription URL format while preventing UUID query failures.

## Risks / Trade-offs

- [Email delivery fails after persistence] → Return message success, log the email error, and retain the thread for admins to see in Daily Operations.
- [Student floods the inbox] → Enforce a server-side content limit and a short per-student send cooldown or rate limit.
- [Admin email link is opened without a session] → Existing admin middleware redirects to login; after login the deep link must be preserved or re-opened.
- [Multiple admins receive duplicate operational alerts] → Per-account opt-out is available; a later ticket-assignment workflow can narrow ownership if needed.
- [A student calls the API with another enrollment ID] → Do not accept a student ID from the request body; resolve it from the authenticated user.

## Migration Plan

1. Add the admin message-notification preference and update the `messages` insert policy in a numbered migration.
2. Apply the migration to the live Supabase project, regenerate database types, and verify pending/certified/blacklisted authorization behavior.
3. Deploy message APIs, email template, and UI error handling together so browser clients no longer depend on direct inserts.
4. Deploy Daily Operations deep-link selection and calendar feed suffix parsing.
5. Roll back application routes if necessary; the persisted preference defaults safely and existing message history remains unchanged.

## Open Questions

- None for launch. Inbound email replies and student email notifications for admin replies are deferred.
