## Context

The `POST /api/schedule/request` route currently inserts a pending schedule row and returns — no admin notification is sent. The `POST /api/schedule/cancel` route already demonstrates the pattern: query active admins, send a branded email, and treat delivery as best-effort. The `admin_accounts` table already has `notify_sms_schedule_requests` (abandoned SMS feature), confirming this notification was intended. A new email toggle `notify_schedule_requested` fills that gap.

## Goals / Non-Goals

**Goals:**
- Send a WFD-branded email to admins who opt in when a student submits a shift request
- Follow the existing admin notification pattern (same email layout, same error handling)
- Add the toggle to the Account Management UI

**Non-Goals:**
- SMS integration (the abandoned `notify_sms_schedule_requests` column is left as-is)
- Changing the schedule request flow beyond adding the email notification
- Individual emails per admin (single email with all recipient addresses, same as cancel route)

## Decisions

1. **Array `to` (single email) vs individual emails per admin**: Use array `to` like the cancel route. Admins are an internal team — seeing each other as recipients is acceptable and the pattern is already established.

2. **Default `true` for new toggle**: Unlike MOU notifications (default `false`), shift signups default to `true` so requests aren't missed for existing admins. This matches `notify_onboarding_complete` and `notify_evaluation_flagged` which also default `true`.

3. **Email template structure**: Use the same layout as `buildShiftCancelledByStudentAdminEmail` — centered message, credential-style info box with student name/date/time/shift type. Subject: "New Shift Request — WFD EMS".

4. **Route integration point**: Add email sending after the successful schedule insert and before the response, inside a try/catch so failures don't block the response.

## Risks / Trade-offs

- [Risk] Admin email addresses included in array `to` are visible to all recipients → Mitigation: All current admins are internal WFD staff; this matches the existing cancel notification behavior.
- [Risk] Resend API rate limits or timeout could delay the schedule request response → Mitigation: The `sendEmail` function has a 5-second timeout; the try/catch ensures the response is returned regardless.
