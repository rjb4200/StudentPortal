## Why

Students can type and submit messages but the database rejects pending-student inserts under the current RLS policy, and the client hides that failure. Messages are not operationally reliable because admins receive neither email notifications nor a direct link to the relevant conversation.

## What Changes

- Repair student message delivery for authenticated, non-blacklisted pending and certified students, with visible submission success and failure feedback.
- Move student and admin message writes behind authenticated server endpoints that validate content, resolve identity server-side, and protect against accidental duplicate or abusive sends.
- Add an opt-in `Student message emails` preference to admin account management; active opted-in admins receive a notification email whenever a student sends a message.
- Add a student-message email template with student context, a message excerpt, and an authenticated deep link that opens the student's conversation in Daily Operations.
- Make Daily Operations honor the conversation deep link and make student/admin message writes surface errors instead of failing silently.
- Fix the personal `.ics` calendar subscription route so URLs displayed and copied by the dashboard resolve the student UUID correctly.

## Capabilities

### New Capabilities
- `student-message-notifications`: Server-backed student messaging notifications, admin opt-in preferences, and conversation reply deep links.

### Modified Capabilities
- `admin-command-center`: Threaded messaging gains reliable server-backed sends and deep-link conversation selection.
- `admin-account-management`: Admin accounts gain a configurable student-message email notification preference.
- `authentication-authorization`: Message authorization permits non-blacklisted pending and certified students to create their own messages while preserving enrollment-scoped access.
- `student-dashboard`: The dashboard message experience reports send outcomes and personal calendar feed URLs resolve correctly.

## Impact

- Affected UI: student Messages section, Daily Operations conversation panel, and Admin Account Management notification controls.
- Affected APIs: new authenticated message send/reply endpoints and calendar feed parameter handling.
- Affected data: admin notification preference, message RLS policy, migrations, and generated Supabase types.
- Affected infrastructure: Resend delivery for opted-in admin recipients. Email failures must not lose an already-persisted portal message.
