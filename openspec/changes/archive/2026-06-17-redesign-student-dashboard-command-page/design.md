## Context

The current student dashboard is a single client page with local tab state for Calendar, Preceptors, and Messages, plus a nested grid/list schedule toggle. It works functionally, but it presents features as widgets instead of answering the student's first questions: "What is my status?", "What should I do next?", and "Where do I click?"

Issue #59 asks for a professional WFD-aligned redesign. The added UX constraint is that students may have little or no training on this portal. The design must make key workflows, especially shift scheduling, discoverable through visible actions and state-based empty states rather than relying on guides or long explanatory text.

Pending students are allowed to access `/dashboard` by current middleware and specs. They should receive a clear pending-review dashboard, not the full scheduling/evaluation toolset.

## Goals / Non-Goals

**Goals:**

- Make `/dashboard` status-first and action-led.
- Give students one obvious primary next action based on their current state.
- Make shift scheduling prominent without requiring students to know that calendar dates are clickable.
- Add summary cards for account status, next approved shift, pending requests, and messages.
- Improve the pending-student dashboard with valid next actions only.
- Replace local tabs with clearer section navigation while preserving existing dashboard capabilities.
- Remove duplicated calendar feed presentation.
- Align visuals with the WFD website's civic/fire-department styling.

**Non-Goals:**

- Change database schema or RLS policies.
- Add a new scheduling workflow beyond the existing shift request modal and schedule records.
- Add message unread-count persistence unless supported by existing data.
- Redesign the admin dashboard.
- Reintroduce long instructional guides as the primary way users understand the page.

## Decisions

### Use a Command Header With State-Derived Primary Action

The top of the dashboard should derive a status label, concise next-step sentence, and primary CTA from student status and schedule state.

Examples:

- Pending student: "Account Pending Review" with primary action "Message Training Staff" and scheduling locked.
- Certified student with no future shifts: "Approved for Clinical Rotations" with primary action "Schedule a Shift".
- Certified student with pending requests: "Waiting on Shift Approval" with primary action "View Pending Requests" and secondary action "Schedule Another Shift".
- Certified student with an upcoming approved shift: "Next Shift Scheduled" with primary action "View Shift Details".

**Rationale:** Students should not have to inspect the calendar or read instructions to understand what to do.

**Alternatives considered:** Keep the existing welcome header and add more explanatory text. This would not solve discoverability for low-training users.

### Keep Scheduling Modal, Add a Prominent Entry Point

The existing calendar date-click flow should remain, but a prominent "Schedule a Shift" CTA should also open the scheduling path. If no date is preselected, the UI can guide the student to choose a date in the schedule section or default to a near-term date only if that behavior is explicit and safe.

**Rationale:** The existing modal and data model already handle shift requests. The missing piece is discoverability, not a new scheduling backend.

**Alternatives considered:** Replace the calendar entirely with a wizard. That may be more obvious but would be a larger interaction change and risks losing the useful calendar mental model.

### Use Clear Section Navigation Instead of Local Feature Tabs

Replace the current tab row with clearer dashboard section navigation such as Schedule, Preceptors & Evaluations, Messages, and Calendar Feed. Implementation can be route-based, query-param-based, or in-page anchor sections, but the chosen approach must be more understandable and maintainable than opaque local tabs.

**Rationale:** The current tabs hide important actions and make the page feel like separate widgets. Sections should map to student jobs-to-be-done.

**Alternatives considered:** Keep tabs and restyle them. This is minimal but does not address the issue's maintainability and navigation concerns as well.

### Make Text Support the UI, Not Carry It

Use concise labels, status badges, empty states, and primary buttons as the main guidance. Text should explain consequences or next steps briefly, not act as a manual.

**Rationale:** Students with little training need affordances and hierarchy first. Text remains useful, but the action should be obvious before reading a paragraph.

**Alternatives considered:** Add more instructional copy around the calendar. This increases clutter and still relies on reading.

### Preserve Pending Access but Lock Unavailable Tools

Pending students should see approval status, expected next step, and valid contact/calendar-feed actions, but should not see shift request, preceptor profile, or evaluation actions as available.

**Rationale:** Existing specs require pending dashboard access. Showing unavailable tools creates confusion and failed actions.

**Alternatives considered:** Redirect pending students away from `/dashboard`. This conflicts with existing onboarding completion specs.

### Remove Dashboard Password Prompt

The old `PasswordChangePrompt` should be removed from the redesigned dashboard if current auth/reset flows supersede it.

**Rationale:** The command page should not be anchored by an obsolete security prompt, and the issue explicitly calls for removal after auth cleanup.

**Alternatives considered:** Restyle and keep it. This preserves legacy behavior but conflicts with the cleanup direction.

## Risks / Trade-offs

- **[Risk] Primary CTA chooses the wrong next action for edge cases** -> Mitigation: Keep the CTA derivation simple and test pending, no-shifts, pending-request, and approved-shift states.
- **[Risk] Route-based navigation expands scope** -> Mitigation: Prefer the smallest navigation approach that satisfies clarity and maintainability; query-param or section navigation is acceptable if full nested routes are too large.
- **[Risk] Removing the password prompt could affect students still using temporary passwords** -> Mitigation: Confirm current auth cleanup/reset flow before removal or explicitly preserve an alternate account-security path.
- **[Risk] WFD styling could reduce app usability if copied too literally** -> Mitigation: Borrow palette, typography direction, bordered cards, and civic hierarchy while preserving accessible contrast and responsive app patterns.
- **[Risk] Message summary may imply unread counts that do not exist** -> Mitigation: Show total/recent message state unless unread tracking already exists.

## Open Questions

- Should the final navigation be nested routes, query-param sections, or in-page section anchors?
- Should the "Schedule a Shift" CTA open the modal immediately with today's date, scroll to the calendar, or open a lightweight date-picking step?
- Is the dashboard password-change prompt fully obsolete now, or should this change defer removal until auth cleanup is confirmed?
