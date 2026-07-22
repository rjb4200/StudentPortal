## 1. Database Migration

- [x] 1.1 Write migration SQL: create `calendar_feed_type` enum and `calendar_feeds` table with unique constraint on `(feed_type, COALESCE(entity_id, ...))`
- [x] 1.2 Add RLS policies on `calendar_feeds`: admin full access, authenticated read-only access for token lookup
- [x] 1.3 Apply migration via Supabase dashboard SQL editor
- [x] 1.4 Apply migration file to `supabase/migrations/` directory

## 2. TypeScript Types

- [x] 2.1 Run `supabase_generate_typescript_types` to regenerate `src/lib/supabase/database.types.ts` with new `calendar_feeds` table and `calendar_feed_type` enum included

## 3. Token-Based iCal Endpoint

- [x] 3.1 Create `src/app/api/calendar/[token]/route.ts` that looks up the token in `calendar_feeds`, dispatches by `feed_type`, and generates the appropriate iCal feed using existing `generateICalFeed`
- [x] 3.2 Ensure the existing `src/app/api/calendar/[studentId]/route.ts` continues to work unchanged (student-ID-based feed with no token lookup)
- [x] 3.3 Unit test: token-based endpoint returns correct feed per type

## 4. Admin Calendar Feed API Routes

- [x] 4.1 Create `POST /api/admin/calendar-feeds/route.ts` — generate or rotate a token (upsert: if row exists replace token, else insert)
- [x] 4.2 Create `DELETE /api/admin/calendar-feeds/route.ts` — revoke token (set token and generated_at to NULL)
- [x] 4.3 Create `POST /api/admin/calendar-feeds/email/route.ts` — send calendar link email via Resend, update `emailed_at`
- [x] 4.4 Add admin auth check to all three routes using existing `canAccessAdmin()` pattern
- [x] 4.5 Add input validation (Zod schemas) for feed_type, entity_id, and recipient email

## 5. Calendar Link Email Template

- [x] 5.1 Add `buildCalendarLinkEmail` function to `src/lib/email-templates.ts` using the WFD-branded HTML template
- [x] 5.2 Template includes: feed URL, brief subscribe instructions, and link to `https://support.google.com/calendar/answer/37118`
- [x] 5.3 Use `students@winchesterfireems.com` from address consistent with all transactional emails
- [x] 5.4 Unit test: verify template renders correctly with escaped values

## 6. CalendarLinkPanel Component

- [x] 6.1 Create `src/components/admin/calendar-link-panel.tsx` with collapsible container (default closed)
- [x] 6.2 Implement feed type selector (Student / TEI / Admin) with radio buttons or tabs
- [x] 6.3 Implement searchable entity dropdowns: student search (by name/email), training site search (by name)
- [x] 6.4 Implement status display: shows "Active" with generated date, "Revoked", or "No link generated"
- [x] 6.5 Implement feed URL display with Copy button using `navigator.clipboard.writeText`
- [x] 6.6 Implement Rotate button (calls POST generate/rotate API, updates displayed URL)
- [x] 6.7 Implement Revoke button with confirmation dialog (calls DELETE API, clears displayed URL)
- [x] 6.8 Implement email section: recipient input field, Send Link button, Resend button, last-emailed timestamp display
- [x] 6.9 Wire all button states correctly (disabled when no token, no recipient, etc.)

## 7. Integrate into Schedule Calendar

- [x] 7.1 Import and render `<CalendarLinkPanel>` at the bottom of `src/components/admin/schedule-calendar.tsx`
- [x] 7.2 Ensure the panel renders below the existing two-column layout (grid + side panel), full-width
- [x] 7.3 Verify the calendar tab layout is not disrupted when panel is closed

## 8. Build and Verify

- [x] 8.1 Run `npm run build` to verify no TypeScript or build errors
- [x] 8.2 Manually test: generate student token, verify feed URL, rotate, revoke
- [x] 8.3 Manually test: TEI feed returns correct students' schedules
- [x] 8.4 Manually test: aggregate feed works after generate/rotate/revoke cycle
- [x] 8.5 Manually test: email send and resend with valid recipient
- [x] 8.6 Verify existing student dashboard calendar link still works unchanged
- [x] 8.7 Verify the existing `/api/calendar/all.ics` aggregate endpoint still works (or is superseded by aggregate token feed)
