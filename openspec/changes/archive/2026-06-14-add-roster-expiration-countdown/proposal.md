## Why

Admins need a quick way to see how much access time each certified student has left without opening the account editor or manually comparing dates. The Student Roster already centralizes operational status, so adding the expiration countdown there makes approaching expirations visible during daily work.

## What Changes

- Add a number-only expiration countdown badge to each Student Roster row when the student has an `access_until` date.
- Display the countdown as a zero-padded three-digit day count, such as `120`, `115`, or `001`.
- Color the countdown badge based on urgency so soon-to-expire students are visually distinct.
- Add hover text that explains the badge, including that it represents days until access expiration.
- Do not add new database fields; derive the value from the existing `students.access_until` timestamp.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `admin-command-center`: The Daily Ops Student Roster will show each student's remaining access countdown as a color-coded badge.

## Impact

- Affects `src/components/admin/daily-ops.tsx` Student Roster presentation logic.
- Uses existing `students.access_until` data already loaded by the roster query.
- No database migration, API route, dependency, or Supabase type changes are expected.
