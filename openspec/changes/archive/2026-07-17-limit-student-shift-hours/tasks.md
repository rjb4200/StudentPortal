## 1. Shift Request Policy

- [x] 1.1 Define shared student-request time options limited to 0700-2200 while retaining existing historical display support.
- [x] 1.2 Update schedule request validation to enforce allowed times, Extended Shift's fixed 0700-2200 range, and increasing custom start/end times.
- [x] 1.3 Update validation tests for allowed Extended Shift requests and rejected after-hours or overnight requests.

## 2. Student Scheduling UI

- [x] 2.1 Replace the Full Shift option with Extended Shift and submit the existing `full` type with 7:00 AM-10:00 PM.
- [x] 2.2 Limit custom dropdown choices to 0700-2200 and prevent invalid custom end times in the UI.
- [x] 2.3 Update related copy so students do not see 24-hour or Full Shift terminology.

## 3. Regression Verification

- [x] 3.1 Confirm existing 0700-to-0700 records still render correctly in dashboard, admin, email, and iCal paths.
- [x] 3.2 Run `npm run test`.
- [x] 3.3 Run `npm run build`.
