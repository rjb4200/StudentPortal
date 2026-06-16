## Context

The onboarding wizard redesign hardcoded `jbrown@winchesterky.com` as the help email in 5 step components. The AGENTS.md and existing codebase patterns show a `message_templates` table with keyed template types for welcome/completion messages. No general-purpose key/value settings table exists yet.

The `/admin/setup` page already hosts 4 onboarding config sections + welcome/completion message editors. Adding a help email editor here follows the existing pattern.

## Goals / Non-Goals

**Goals:**
- Store the help email in a database table so admins can change it without a code deploy
- Provide a simple text input on `/admin/setup` to edit the email
- Onboarding flow reads the email from the database at render time
- Fall back to a hardcoded default if no setting is configured

**Non-Goals:**
- No full site-settings CMS (just key/value for now)
- No per-step help email overrides (one email for all steps)
- No email validation beyond a basic text input
- No RLS policy complexity — admin writes, anon reads (single public setting)

## Decisions

### Decision 1: Key/value table over a single-row config table

**Choice**: Create `portal_settings` with `key` text PK and `value` text.

```sql
CREATE TABLE portal_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Rationale**: A key/value table is extensible — future settings (contact phone, department name, maintenance mode flag) can be added as new rows without schema changes. This avoids creating a new table every time a setting is needed.

**Alternatives considered**:
- Single-row table with typed columns (`help_email text, contact_phone text, ...`) — simpler queries but requires a migration for every new setting
- `message_templates` table with a `help_contact` template type — abuses the template concept (no title/body distinction needed for a simple email)
- Environment variable — requires redeploy to change, defeats the purpose

### Decision 2: API route over server component for settings fetch

**Choice**: Create `GET /api/settings?key=help_email` that reads from `portal_settings`. The onboarding `page.tsx` (client component) fetches it on mount.

**Rationale**: The onboarding page is a `'use client'` component (it manages step state, localStorage, etc.). It can't use `async` server components directly. An API route is the simplest way to bridge client-side rendering with server-side data. The endpoint uses the anon key (no auth required for public settings).

**Alternatives considered**:
- Convert onboarding page to a server component with a client sub-component — adds complexity for a single setting
- Pass via a server-side layout — onboarding has no `layout.tsx`, adding one just for one prop is overkill
- Supabase direct query from the client — works but exposes the `portal_settings` table to the anon client; an API route keeps the table name private

### Decision 3: Prop drilling over a React context

**Choice**: The onboarding `page.tsx` fetches the email once and passes it as a `helpEmail` prop to each step component.

**Rationale**: Only 5 components need it, all rendered by the same parent. Context would be overhead for such a shallow tree. Props are explicit and easy to trace.

**Alternatives considered**:
- React context — cleaner for deep trees, but the onboarding tree is 2 levels deep at most
- Each component fetches independently — 5 redundant network requests per onboarding session

### Decision 4: Admin UI as an inline card on the setup page

**Choice**: Add a `<Card>` section to `/admin/setup/page.tsx` with an `<Input>` for the email and a save `<Button>`. Follow the same pattern as the existing welcome/completion message cards.

**Rationale**: Consistent with the existing page layout. No need for a separate component file for a single input field.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| API route exposes internal table name if anon key is compromised | The anon key already has access to public tables via RLS. The API route just wraps the query. |
| No RLS on `portal_settings` — anyone with anon key can read all settings | Add RLS: allow anon SELECT where `key` matches a whitelist of public keys. If admin-only settings are added later, they're protected. |
| Single email for all steps feels inflexible if future steps need different contacts | The key/value model supports `help_email_step_1`, etc. if needed later. Not building it now. |
