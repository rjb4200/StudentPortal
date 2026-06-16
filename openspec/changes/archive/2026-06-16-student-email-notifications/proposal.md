## Why

Three student-facing emails are promised but never sent: account approval (the onboarding email says "you'll receive a confirmation email when approved" — none comes), schedule approval, and schedule rejection. Additionally, the onboarding credential email has an inconsistent header color in its HTML template.

## What Changes

- **Fix existing email**: Change onboarding credential email CTA button and related inline colors from `#B61C20` to `#A40104` to match the header and the rest of the portal's crimson.
- **Add account-approved email**: When an admin approves a student via `POST /api/admin/approve-student`, send the student a WFD-branded email notifying them their account is now active, with a link to `/login`.
- **Add schedule action emails**: Move schedule approve/reject from a client-side direct Supabase call to a new `POST /api/admin/schedule-action` route that both updates the schedule status AND sends the appropriate WFD-branded email to the student.
- **All new emails** SHALL use the same WFD-branded HTML template as the onboarding credential email (logo header, crimson `#A40104` band, charcoal `#1C1C1E` border, credential-style body).
- **Cleanup**: Delete `src/lib/email.ts` (never imported — dead code) and remove unused `approveStudent`/`getPendingStudents` from `src/lib/auth.ts`.

## Capabilities

### New Capabilities

- `student-email-notifications`: Three new transactional emails styled with the WFD brand template — account approved, schedule approved, and schedule rejected — plus a unified schedule-action API route.

### Modified Capabilities

- `notifications-alerts`: The admin approve-student route now sends a student email. The schedule approve/reject flow moves from a client-side direct call to a server API route that includes email delivery.

## Impact

- **New file**: `src/app/api/admin/schedule-action/route.ts`
- **Modified**: `src/app/api/admin/approve-student/route.ts`, `src/app/api/notify/onboarding-complete/route.ts`, `src/components/admin/daily-ops.tsx`
- **Deleted**: `src/lib/email.ts`, unused functions from `src/lib/auth.ts`
- **No new dependencies, no database migrations**
