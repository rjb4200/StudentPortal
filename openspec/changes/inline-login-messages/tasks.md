## 1. Login page rework

- [x] 1.1 Extend `LoginMessage` type to support `warning` type, `actionLabel`, and `actionHref` optional fields
- [x] 1.2 Add `REASON_MESSAGES` constant mapping `expired`, `blacklisted`, `archived`, `not-registered` to their `LoginMessage` objects
- [x] 1.3 Add `useEffect` on mount to read `reason` from `window.location.search` and display the corresponding message
- [x] 1.4 Replace the "no students found" redirect (`window.location.href = '/onboarding'`) with `setMessage(REASON_MESSAGES['not-registered'])` and early return
- [x] 1.5 Replace the blacklisted redirect (`window.location.href = '/blacklisted'`) with `setMessage(REASON_MESSAGES['blacklisted'])` and early return
- [x] 1.6 Replace the archived/expired redirects with `setMessage()` calls using the appropriate reason message and early return
- [x] 1.7 Update the message rendering block to support `warning` styling (bg-wfd-gold/10, text-wfd-gold) and render an action link when `actionLabel` and `actionHref` are present

## 2. Middleware redirect updates

- [x] 2.1 Change blacklisted redirect target from `/blacklisted` to `/login?reason=blacklisted`
- [x] 2.2 Change expired redirect target from `/expired` to `/login?reason=expired`
- [x] 2.3 Change archived redirect target from `/onboarding?status=archived` to `/login?reason=archived`
- [x] 2.4 Change no-student-record redirect target from `/onboarding` to `/login?reason=not-registered`
- [x] 2.5 Change catch-all (not certified/pending) redirect target from `/onboarding` to `/login?reason=not-registered`

## 3. Auth callback redirect updates

- [x] 3.1 Change blacklisted redirect target from `${origin}/blacklisted` to `${origin}/login?reason=blacklisted`
- [x] 3.2 Change expired redirect target from `${origin}/expired` to `${origin}/login?reason=expired`
- [x] 3.3 Change archived redirect target from `${origin}/onboarding?status=archived` to `${origin}/login?reason=archived`
- [x] 3.4 Change no-student-record redirect target from `${origin}/onboarding` to `${origin}/login?reason=not-registered`
- [x] 3.5 Change catch-all (not certified/pending) redirect target from `${origin}/onboarding` to `${origin}/login?reason=not-registered`

## 4. Cleanup

- [x] 4.1 Remove `/expired` and `/blacklisted` from `PUBLIC_PATHS` array in `src/app/layout.tsx`
- [x] 4.2 Update or remove `/blacklisted` and `/expired` links in `src/app/admin/dev/page.tsx`
- [x] 4.3 Delete `src/app/blacklisted/page.tsx`
- [x] 4.4 Delete `src/app/expired/page.tsx`

## 5. Verification

- [x] 5.1 Run `npm run build` and confirm zero errors
- [x] 5.2 Verify login page renders inline messages for all four failure states (no-record, blacklisted, archived, expired)
- [x] 5.3 Verify action buttons navigate to correct onboarding paths
- [x] 5.4 Verify `/blacklisted` and `/expired` URLs return 404
- [x] 5.5 Verify successful student login still redirects to `/dashboard`
