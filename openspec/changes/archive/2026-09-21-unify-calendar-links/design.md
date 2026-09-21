## Context

The `add-calendar-link-controls` change created a `calendar_feeds` table and admin management panel, but did not integrate the new token system into existing calendar link surfaces — the student dashboard and the admin maintenance page. Those surfaces still construct and display raw student-ID URLs (`/api/calendar/{studentId}.ics`) and the hardcoded `/api/calendar/all.ics`. This means the rotate, revoke, and email controls in the admin panel have no effect on the links students and TEIs actually use. This change closes that gap.

## Goals / Non-Goals

**Goals:**
- Every calendar link a student sees is a managed, rotatable, revocable token URL
- Tokens are created at the moment a student is approved (not on first admin access to the panel)
- The aggregate feed link on the maintenance page uses the admin aggregate token
- Existing certified students receive tokens via backfill
- Existing external subscriptions to old URLs continue working (legacy fallback path preserved)

**Non-Goals:**
- Removing the legacy fallback path in the endpoint (kept for backward compatibility)
- Changing the student dashboard UI beyond the URL it copies
- Modifying TEI-level calendar link flow (TEI links are sent by admin, not surfaced on any student-facing page)

## Decisions

### 1. Auto-generate token at approve-student rather than at panel access

**Chosen**: Add token creation to the `approveStudent` function in `src/lib/auth.ts`. The existing admin panel auto-generation is kept as a safety net (for TEI links and admins who navigate to the panel before approving anyone).

**Rationale**: Student approval is the natural trigger — there are no schedules to show before approval. This ensures the token exists by the time the student first visits their dashboard.

### 2. New helper to get a student's feed URL from calendar_feeds

**Chosen**: Add `getStudentCalendarFeedUrl(siteUrl)` as a server-side function in `calendar-feed.ts` that queries `calendar_feeds` for the student's token and builds the URL. Keep `getCalendarFeedUrl(siteUrl, studentId)` for backward compat (used by legacy code paths).

**Rationale**: The student dashboard needs the URL at render time. A server component or API call can fetch the token. The existing function stays for any code that hasn't migrated yet.

### 3. Dashboard fetches token URL via API

**Chosen**: The student dashboard calls a simple GET endpoint that returns the feed URL for the authenticated student. This avoids needing `calendar_feeds` RLS for direct student access (the table currently only has admin-write and public-read-for-token-lookup policies).

Actually — simpler: update the admin client query in the dashboard server component to read the student's `calendar_feeds` row. Since it's a server component with access to the authenticated user, it can use the admin client to fetch the token and build the URL.

**Even simpler**: Add a lightweight API route `GET /api/calendar/my-feed-url` that returns the token-based feed URL for the authenticated student. Required because the dashboard is a client component and can't use admin client directly. OR just make `calendar_feeds` readable by the owning student via RLS.

**Final decision**: Add an RLS policy on `calendar_feeds` that lets students read their own row (`entity_id = auth.uid()` for `feed_type = 'student'`). Then the student dashboard can query it directly with a simple supabase client call. This avoids a new API route.

### 4. Maintenance page aggregate URL

**Chosen**: The maintenance page already fetches data via the admin client. It will query `calendar_feeds` for the aggregate row's token and build the URL from that, falling back to the old hardcoded `/api/calendar/all.ics` if no token exists yet (backward compatibility during roll-out).

### 5. Backfill approach

**Chosen**: A standalone SQL script applied via Supabase dashboard that inserts a `calendar_feeds` row with a fresh token for every student with `status = 'certified'` who doesn't already have one. Also creates the aggregate row if it doesn't exist.

**Rationale**: One-time data fix, not application logic. Doesn't belong in a migration or runtime code. The SQL is also saved as a migration file for documentation.

### 6. Shared `resolveCalendarFeedUrl` helper for email templates

**Chosen**: Add a server-side helper that looks up a `calendar_feeds` row by `(feed_type, entity_id)`, auto-generates a token if none exists, and returns the full feed URL. All email-sending API routes call this helper to get the URL before rendering templates.

**Rationale**: Six email templates across four API routes would otherwise duplicate the same selector-and-generate logic. Centralizing ensures consistent auto-generation behavior everywhere — a token always exists by the time an email references it.

**Alternatives considered**: Pass feed URL as a function parameter everywhere (more boilerplate, easy to miss a call site).

### 7. Test email recipient

**Chosen**: Each modified email template is verified by sending a test email to `rbrown@winchesterky.com` after implementation. The test uses the first available student/instructor/site data from the database.

**Rationale**: Email rendering bugs are invisible until a real email is sent. Manual test emails let the reviewer inspect branding, link formatting, and instructions before deployment.

## Data Flow After Change

```
Student approval
  │
  ▼
approveStudent() ──► INSERT INTO calendar_feeds (student, token)
  │
  ▼
Student visits dashboard ──► SELECT token FROM calendar_feeds WHERE entity_id = $uid
  │                              │
  │                              ▼
  │                         Build URL: /api/calendar/{token}.ics
  │
  ▼
Student sees token URL with [Copy] button
  │
  ▼
Admin can rotate/revoke this token → student sees updated URL next page load

Maintenance page ──► SELECT token FROM calendar_feeds WHERE feed_type = 'aggregate'
                        │
                        ▼
                   Build URL: /api/calendar/{token}.ics
```

## Risks / Trade-offs

- **Dashboard URL change**: Existing students who bookmarked or subscribed via the old studentId URL will see a different URL in the dashboard. → Mitigation: Legacy endpoint still works for existing subscriptions. New URL shown in UI going forward.
- **RLS addition**: Adding a student-read policy on `calendar_feeds` means the table is now partially student-accessible. → Mitigation: Scoped policy — students can only read their own row by `entity_id`.
- **approveStudent modification**: Adding a DB write to the approval flow. → Mitigation: Token creation is `INSERT ... ON CONFLICT DO NOTHING` — idempotent, won't fail on re-approval edge cases.
- **Shift email payload growth**: Adding a feed URL lookup to each email-sending path adds a DB query. → Mitigation: Single point lookup via a shared `resolveToken` helper that handles auto-generation. Acceptable overhead given email sends are already async with Resend API calls.

## Migration Plan

1. Deploy code changes (RLS policy, approve-student, dashboard, maintenance page)
2. Run backfill SQL against production to generate tokens for existing certified students and the aggregate feed
3. Verify student dashboard shows token URLs
4. Verify admin panel shows tokens for students selected (auto-generated on first panel access if not yet created by approval flow)
