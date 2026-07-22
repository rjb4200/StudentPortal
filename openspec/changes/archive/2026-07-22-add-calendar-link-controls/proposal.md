## Why

Students, TEIs, and administrators need subscribable iCal feeds for approved shifts, but there is currently no way to manage, revoke, or regenerate these feed links from the admin interface. Once generated, the raw student-ID URLs are permanent and cannot be rotated or revoked. Admins also have no way to email a calendar link to a student, a TEI coordinator, or an admin colleague. This change adds token-based calendar feeds at three tiers (student, TEI, aggregate) with full admin controls for rotation, revocation, copy, and email delivery.

## What Changes

- Add a `calendar_feeds` table to store per-entity feed tokens (student, training site, aggregate) with generation and email timestamps
- Add a token-based calendar feed endpoint that serves the correct iCal data based on feed type
- Add a collapsible "Calendar Links" admin panel at the bottom of the Schedule Calendar tab with:
  - Feed type selector (Student / TEI / Admin)
  - Entity selector (specific student or training site) for student and TEI feeds
  - Token generation on first access, with rotate and revoke controls
  - Copy link button
  - Email/Resend controls with recipient input and last-emailed timestamp
- Add a WFD-branded calendar link email template with Google Calendar subscribe instructions
- Backward-compatible: existing `/api/calendar/{studentId}.ics` endpoint continues to work unchanged

## Capabilities

### New Capabilities
- `calendar-link-management`: Token-based calendar feed generation, rotation, revocation, and email delivery at three tiers (student, TEI, admin aggregate), managed from a collapsible panel in the admin schedule calendar

### Modified Capabilities
- `scheduling-calendar`: The iCal feed endpoint gains a token-based access path (`/api/calendar/{token}.ics`) alongside the existing student-ID path; the new endpoint serves student, TEI, or aggregate feeds depending on the token's feed type

## Impact

- **DB**: New `calendar_feeds` table with RLS, plus migration
- **API**: Modified `GET /api/calendar/[...]` route, new admin calendar-link management routes
- **UI**: New `CalendarLinkPanel` component rendered at the bottom of `src/components/admin/schedule-calendar.tsx`
- **Email**: New `buildCalendarLinkEmail` template in `src/lib/email-templates.ts`, new admin API route for sending
- **Types**: `database.types.ts` regeneration needed after migration
