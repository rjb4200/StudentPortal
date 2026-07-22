## Context

The Student Portal currently generates iCal feeds using raw student UUIDs in the URL path (`/api/calendar/{studentId}.ics`). There is no authentication, no revocation capability, and no admin interface for managing these links. The existing feed endpoints (`[studentId]` and `all`) are dynamically generated with no stored state.

The admin Schedule Calendar tab (`schedule-calendar.tsx`) is a scheduling console for date-level operations (blocking days, viewing schedules). It has no per-student or per-entity management surface.

Email delivery uses Resend via `src/lib/email.ts` with WFD-branded templates from `src/lib/email-templates.ts`. All existing transactional emails follow a consistent pattern: build HTML, call `sendEmail()`, log failures, treat email as best-effort.

## Goals / Non-Goals

**Goals:**
- Store revocable, rotatable tokens for three feed types: student, TEI (training site), admin aggregate
- Provide a collapsible admin panel at the bottom of the Schedule Calendar tab to manage all three feed types
- Send WFD-branded emails containing the calendar link with Google Calendar subscribe instructions
- Maintain backward compatibility with the existing `/api/calendar/{studentId}.ics` endpoint

**Non-Goals:**
- Authenticating iCal feed requests (tokens are bearer secrets, no auth header required)
- Per-class calendar feeds (out of scope; only student/TEI/aggregate tiers)
- Expiring tokens automatically (rotation is manual, revocation is manual)
- Changing the student dashboard calendar feed UI (it continues using the existing studentId endpoint)
- Rate limiting feed access (token is the only access control)

## Decisions

### 1. Separate `calendar_feeds` table over columns on `students` + `training_sites`

**Chosen**: A dedicated `calendar_feeds` table with `(feed_type, entity_id)` unique constraint.

**Rationale**: The admin aggregate feed has no natural home table (it's not tied to a single student or site). A single table keeps all token logic centralized, makes queries uniform, and avoids polluting the `students` and `training_sites` schemas with calendar infrastructure columns.

**Alternatives considered**:
- Columns on `students` + `training_sites` + a third location for aggregate: Scatters logic, requires different queries per type.
- A `calendar_links` JSON column on some config table: Harder to query, no referential integrity.

### 2. Single endpoint dispatching by feed type

**Chosen**: `GET /api/calendar/{token}.ics` — looks up the token in `calendar_feeds`, reads `feed_type`, and dispatches to the appropriate query (student schedule, TEI schedules, or all approved schedules).

**Rationale**: One URL pattern for all feed types simplifies the admin UI (one copy button, one email template). The existing `[studentId]` endpoint continues working for backward compat. Next.js file-based routing supports a catch-all that can differentiate UUID-style student IDs from token UUIDs.

**Alternatives considered**:
- Separate endpoints per type (`/api/calendar/student/{token}.ics`, etc.): More routes, more UI complexity, no real benefit.

### 3. Token auto-generation on first admin access

**Chosen**: When an admin selects a student/site in the Calendar Links panel and no token exists, the token is generated automatically and the feed becomes active. No separate "Generate" button needed.

**Rationale**: Reduces steps. The admin's intent is clear when they select an entity and open the panel. "Rotate" replaces the token on demand. "Revoke" clears it. This gives three states: no token (never generated), active (token exists), revoked (token was cleared).

**Alternatives considered**:
- Manual "Generate" button: Adds an unnecessary step for the common case.

### 4. Collapsible panel at bottom of ScheduleCalendar

**Chosen**: A `<details>` or controlled collapsible section appended after the existing calendar grid + side panel layout, default closed.

**Rationale**: The user explicitly requested placement "at the bottom of the admin calendar page." The calendar tab already has a two-column layout (grid + side panel). Adding a full-width section below both columns is the least disruptive approach. Default closed ensures it doesn't compete with the primary scheduling workflow.

### 5. API route structure

Three new admin routes under `/api/admin/calendar-feeds/`:

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/admin/calendar-feeds` | Generate or rotate a token (upsert: if token exists, replace it) |
| `DELETE` | `/api/admin/calendar-feeds` | Revoke token (set `token = NULL` and `generated_at = NULL`) |
| `POST` | `/api/admin/calendar-feeds/email` | Send calendar link email via Resend, update `emailed_at` |

All routes require admin auth. All accept `{ feed_type, entity_id }` body (entity_id is null for aggregate).

### 6. Backend-generated feed URL

**Chosen**: The feed URL is constructed server-side using `NEXT_PUBLIC_SITE_URL` (already available via `src/lib/env.ts`). The admin API returns the full URL in responses; the client never constructs it.

**Rationale**: Single source of truth for URL construction. Avoids client-side dependency on env vars.

## Data Model

```sql
CREATE TYPE calendar_feed_type AS ENUM ('student', 'training_site', 'aggregate');

CREATE TABLE public.calendar_feeds (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_type   calendar_feed_type NOT NULL,
  entity_id   uuid,  -- students.id or training_sites.id (NULL for aggregate)
  token       uuid UNIQUE,  -- NULL = revoked / never generated
  generated_at timestamptz,
  emailed_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (feed_type, COALESCE(entity_id, '00000000-0000-0000-0000-000000000000'))
);
```

- `feed_type = 'aggregate'` has exactly one row (`entity_id = NULL`)
- `feed_type = 'student'` has at most one row per student
- `feed_type = 'training_site'` has at most one row per training site
- `token` being NULL means the feed is revoked or was never generated

## Component Architecture

```
ScheduleCalendar (schedule-calendar.tsx)
├── [existing] Month grid + side panel (unchanged)
└── CalendarLinkPanel (new, collapsed by default)
    ├── Feed type selector (Student | TEI | Admin)
    ├── Entity selector (searchable dropdown)
    │   - Student type: search students by name/email
    │   - TEI type: search training sites by name
    │   - Admin type: hidden (no selection needed)
    ├── Status display (active / revoked / never generated)
    ├── Feed URL display with Copy button
    ├── Rotate + Revoke buttons
    └── Email section: recipient input, Send/Resend buttons, last-emailed timestamp
```

## Email Template

New `buildCalendarLinkEmail` function in `email-templates.ts`:

- Subject: "WFD EMS Calendar Subscription"
- Body: WFD-branded HTML with the calendar feed URL, brief instructions ("Add this to your Google Calendar, Apple Calendar, or Outlook"), and a link to Google's subscribe documentation: `https://support.google.com/calendar/answer/37118`
- From: `students@winchesterfireems.com` (consistent with all other transactional emails)
- Recipient: Provided by admin in the UI input field (not auto-derived from student record)

## Risks / Trade-offs

- **Token enumeration**: UUID tokens are not cryptographically secret but are unguessable in practice. If a token leaks, anyone can subscribe. → Mitigation: Rotate replaces the token, immediately invalidating the old URL.
- **Aggregate feed race condition**: Only one aggregate feed row exists. If two admins rotate it simultaneously, one request wins. → Mitigation: Acceptable; the last write determines the active token.
- **Existing studentId endpoint remains unauthenticated**: Anyone who knows a student UUID can still access their calendar. → Mitigation: Out of scope for this change. The new token-based path is the controlled surface; the legacy endpoint can be deprecated separately.
- **No rate limiting on feed endpoint**: A malicious actor with a valid token could hammer the endpoint. → Mitigation: Acceptable for now; the endpoint does a simple DB lookup + iCal generation. Can add rate limiting later if needed.
