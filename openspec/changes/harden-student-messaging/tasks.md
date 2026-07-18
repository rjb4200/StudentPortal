## 1. Authorization and Data

- [x] 1.1 Create and apply a numbered Supabase migration that adds the admin student-message notification preference and updates message authorization for eligible pending and certified students.
- [ ] 1.2 Verify RLS behavior in the live database for pending, certified, blacklisted, expired, and cross-student message attempts.
- [x] 1.3 Regenerate `src/lib/supabase/database.types.ts` after the migration.

## 2. Server-Side Messaging

- [x] 2.1 Add validation for bounded message content and a server-side rate-limit or cooldown strategy for student sends.
- [x] 2.2 Implement the authenticated student message endpoint that resolves the enrollment from the session, persists the message, and returns the stored row.
- [x] 2.3 Implement the authenticated admin reply endpoint that validates admin access, persists the reply, and returns the stored row.
- [x] 2.4 Add a student-message email template and send alerts to active admins with the notification preference enabled without treating email delivery as message persistence.
- [ ] 2.5 Add route tests for authorization, enrollment ownership, validation failures, opted-in recipients, email failure resilience, and message persistence.

## 3. Messaging Experience

- [x] 3.1 Replace student direct message inserts with the server endpoint and add visible success and failure feedback without discarding unsent text.
- [x] 3.2 Replace Daily Operations direct admin replies with the server endpoint and preserve entered text on failure.
- [x] 3.3 Add the `Student message emails` preference to admin account create/edit/save flows.
- [x] 3.4 Support the `student` Daily Operations query parameter so email links open the correct conversation.
- [ ] 3.5 Add focused component or unit tests for message state, URL-driven thread selection, and notification preference persistence.

## 4. Calendar Feed Repair

- [x] 4.1 Update the personal calendar feed route to parse `.ics` subscription parameters into a valid student UUID before querying.
- [ ] 4.2 Add route coverage for a copied absolute `.ics` subscription URL and an invalid student identifier.

## 5. Verification and Launch Review

- [x] 5.1 Run `npm run test` and fix all messaging and feed failures.
- [x] 5.2 Run `npm run build`.
- [ ] 5.3 Perform an authenticated manual test with pending and certified student accounts: send a message, verify the dashboard thread, admin deep link, opted-in email alert, opt-out behavior, and admin reply.
- [ ] 5.4 Run Supabase security and performance advisors after the migration and resolve or document new findings.
