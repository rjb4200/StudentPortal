## 1. Dashboard State Model

- [x] 1.1 Derive dashboard summary values from existing student, schedules, and messages data: account status, next approved shift, pending request count, and message summary.
- [x] 1.2 Define state-based primary actions for pending, certified-with-no-shifts, certified-with-pending-requests, and certified-with-upcoming-shift states.
- [x] 1.3 Ensure pending students only receive valid dashboard actions and cannot access scheduling, preceptor, or evaluation actions.

## 2. Command Page Layout

- [x] 2.1 Replace the current widget/tab-first dashboard header with a status-first command header.
- [x] 2.2 Add responsive summary cards for account status, next shift, pending requests, and messages.
- [x] 2.3 Add a prominent "Schedule a Shift" primary CTA for certified students that leads into the existing shift request flow.
- [x] 2.4 Replace local feature tabs with clearer dashboard section navigation for schedule, preceptors/evaluations, messages, and calendar feed.
- [x] 2.5 Present the personal calendar feed in one clear utility location and remove duplicated calendar feed copy.

## 3. Dashboard Sections

- [x] 3.1 Preserve the calendar grid and shift list views inside the redesigned schedule section.
- [x] 3.2 Preserve existing shift detail, shift request, and cancellation modal behavior.
- [x] 3.3 Preserve preceptor gallery and evaluation submission for certified students.
- [x] 3.4 Preserve student messaging and expose it as a valid pending-student action.
- [x] 3.5 Remove the legacy dashboard `PasswordChangePrompt` and its dashboard gating behavior.

## 4. WFD Visual Design

- [x] 4.1 Apply WFD website-inspired visual hierarchy using crimson, charcoal, green accents, formal headers, bordered cards, and clear action hierarchy.
- [x] 4.2 Ensure the redesigned dashboard is responsive on mobile and desktop.
- [x] 4.3 Ensure key actions are visually discoverable without relying on long instructional text.

## 5. Specs And Verification

- [x] 5.1 Update active `student-dashboard` specs with the command-page requirements after implementation.
- [x] 5.2 Update active `scheduling-calendar` specs with the discoverable scheduling action requirement after implementation.
- [x] 5.3 Update active `onboarding-completion-flow` specs with the improved pending dashboard behavior after implementation.
- [x] 5.4 Update active `password-auth-system` specs to remove the first-login dashboard password prompt after implementation.
- [x] 5.5 Run `npm run build`.
- [x] 5.6 Manually review dashboard states for pending, certified with no shifts, certified with pending requests, and certified with an approved upcoming shift on desktop and mobile widths.
