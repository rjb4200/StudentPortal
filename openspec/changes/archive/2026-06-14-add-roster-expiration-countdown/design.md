## Context

The Daily Ops Student Roster currently loads all student rows with `select('*')` and displays status, blacklist, no-show, and action controls. Student certification already sets `students.access_until` to 120 days from approval, and the daily cron uses the same field to mark expired students.

## Goals / Non-Goals

**Goals:**

- Show a compact, number-only countdown badge in each Student Roster row for students with an `access_until` value.
- Format the badge as a zero-padded three-digit number representing days remaining until access expiration.
- Color the badge by urgency and provide hover text explaining the value.
- Reuse existing roster data and UI primitives where possible.

**Non-Goals:**

- Do not add or persist a separate countdown field.
- Do not change the 120-day certification window.
- Do not change the cron expiration behavior.
- Do not add student-facing countdown UI as part of this change.

## Decisions

### Derive countdown from `access_until`

The roster should compute the countdown from the existing `students.access_until` timestamp at render time. This keeps the display consistent with the field already used for access enforcement and avoids data drift from storing a duplicated countdown value.

Alternative considered: store a countdown value in the database. This was rejected because the value changes daily and would require scheduled updates or stale values.

### Use calendar-day style display with zero padding

The badge should show a number-only label padded to three digits, such as `120`, `115`, or `001`. Expired or past-due dates should display as `000` rather than a negative value.

Alternative considered: display `115 days` or `EXP 115`. This was rejected because the requested display is number-only and the existing roster already has limited horizontal space.

### Use color to communicate urgency

The badge should use existing badge color variants to make urgency visible without adding a new component style system. A practical threshold model is:

- Green for more than 30 days remaining.
- Orange or gold for 8 to 30 days remaining.
- Red for 1 to 7 days remaining.
- Gray or red for `000`, depending on whether the final implementation wants to distinguish expired from urgent.

Alternative considered: a single neutral badge. This was rejected because color was explicitly desired and helps admins scan the roster.

### Use native hover text

The badge should use a native hover tooltip, such as the `title` attribute, to explain the number without adding a custom tooltip dependency. The hover text should clarify that the number represents days until access expiration and may include the actual expiration date.

Alternative considered: custom tooltip component. This was rejected because the app does not currently need richer tooltip behavior for this small roster enhancement.

## Risks / Trade-offs

- Date rounding ambiguity could show one day more or less depending on time of day -> Use a consistent day calculation and clamp below zero to `000`.
- Students without `access_until` cannot show a meaningful countdown -> Hide the countdown badge when the date is missing.
- Native `title` hover is limited on touch devices -> Acceptable because this is an admin desktop-oriented roster enhancement and the visible number/color still communicates the key state.
