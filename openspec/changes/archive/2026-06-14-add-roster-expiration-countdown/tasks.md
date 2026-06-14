## 1. Countdown Logic

- [x] 1.1 Add roster-local logic to derive days remaining from each student's `access_until` value.
- [x] 1.2 Format the countdown as a three-digit, zero-padded number and clamp expired/past-due values to `000`.
- [x] 1.3 Map remaining-day ranges to existing badge color variants for normal, warning, urgent, and expired states.

## 2. Roster Display

- [x] 2.1 Render the countdown badge beside the existing status badges in the Daily Ops Student Roster.
- [x] 2.2 Add hover text to the countdown badge explaining that the number is days remaining until access expiration.
- [x] 2.3 Hide the countdown badge for students without an `access_until` value.

## 3. Verification

- [x] 3.1 Run `npm run build` to verify the Next.js application compiles.
- [x] 3.2 Manually inspect representative countdown cases: `120`, warning range, `001`, `000`, and missing `access_until`.
