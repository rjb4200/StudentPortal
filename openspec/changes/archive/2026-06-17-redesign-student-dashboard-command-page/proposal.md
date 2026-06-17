## Why

The student dashboard currently feels like a collection of widgets and local tabs rather than a command page that tells students what matters now. Many students will have little or no training on the portal, so key actions such as scheduling a shift must be visually obvious and state-driven instead of relying on users to read guides or infer that calendar dates are clickable.

## What Changes

- Redesign `/dashboard` around the student's current status and next recommended action.
- Add a status-first command header that clearly communicates account state, approval/access status, and the most important next step.
- Add summary cards for account status, next scheduled shift, pending requests, and messages.
- Make shift scheduling a prominent primary action for certified students, especially when they have no upcoming or pending shifts.
- Improve pending-student dashboard state with clear next steps and only valid actions, such as waiting for approval and messaging staff.
- Replace local tab-style navigation with clearer section navigation or route/query-based navigation that is easier to understand and maintain.
- Remove duplicated calendar feed copy and present calendar subscription as a single utility/action.
- Remove the old dashboard password-change prompt once auth cleanup makes it obsolete.
- Align visual styling with `rjb4200/wfdwebsite`: formal WFD red/charcoal/green civic styling, stronger headers, clear action cards, and responsive layouts.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `student-dashboard`: Change the dashboard from widget/tab-first layout to a status-driven command page with summary cards, prominent next actions, clearer navigation, and WFD-aligned visual design.
- `scheduling-calendar`: Make shift scheduling discoverable through a primary call to action in addition to calendar date selection, and preserve calendar/list schedule management inside the redesigned dashboard.
- `onboarding-completion-flow`: Improve the pending-student dashboard state so pending students understand approval status and valid next steps without seeing unavailable scheduling/evaluation tools.
- `password-auth-system`: Remove the dashboard-level temporary-password change prompt from the redesigned dashboard if the auth cleanup path has superseded it.

## Impact

- Code: `src/app/dashboard/page.tsx` and dashboard components in `src/components/dashboard/`.
- UI/UX: Certified and pending student dashboard layouts, primary action hierarchy, navigation, empty states, and calendar feed placement.
- Specs: Active dashboard, scheduling, onboarding completion, and password-auth behavior requirements.
- No database schema changes are expected.
- Verification should include `npm run build` plus desktop/mobile review of pending, certified-with-no-shifts, certified-with-pending-requests, and certified-with-approved-shift states.
