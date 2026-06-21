## Why

The notification routes `/api/notify/evaluation-receipt` and `/api/notify/flagged-evaluation` accept IDs from the request body, use the Supabase service-role admin client, and send email without verifying the caller. Anonymous callers can trigger emails, probe student/preceptor names, and generate false flagged evaluation alerts.

## What Changes

- Add cookie-based session verification to both notification endpoints using the same pattern as other protected API routes.
- Verify the caller is a student whose `auth_user_id` matches the `studentId` in the request body.
- Return generic 401/403 responses that do not disclose whether IDs exist.
- Retain the existing email-sending behavior for authorized callers.

## GitHub Issue

#92 - Security: Authenticate notification endpoints and prevent abuse

## Root Cause

Both endpoints create an admin client (service role) to read student and preceptor data, then send email — but never verify the caller's identity or ownership of the referenced records.

## Proposed Solution

Adopt the same auth pattern already used by `src/app/api/schedule/cancel/route.ts`:
1. Extract cookies from the `cookie` request header.
2. Create a Supabase server client with those cookies.
3. Call `auth.getUser()` to verify the session.
4. Query `students` by `auth_user_id` to get the caller's student record.
5. Require the caller's `student.id` to match the `studentId` in the request body.

## Scope

- `src/app/api/notify/evaluation-receipt/route.ts`
- `src/app/api/notify/flagged-evaluation/route.ts`

## Non-goals

- Rate limiting (deferred to future infrastructure work).
- Moving notification logic into the evaluation submission flow (larger refactor deferred).
- Securing the `onboarding-complete` endpoint (it already uses token verification).

## Risk Assessment

- Regression Risk: Low (2/10). Only affects two notification endpoints that are called after evaluation submission. The caller is always a logged-in student whose session matches the evaluation studentId.
- Fix Confidence: High (9/10). Establishes pattern already proven in `schedule/cancel`.
- Verification Confidence: High (9/10). Can verify by inspecting code and testing that unauthenticated requests are rejected.

## Verification Plan

1. Confirm the code compiles: `npm run build`
2. Review that cookie parsing, `getUser()`, and student ownership check follow the established pattern.
3. Confirm generic error responses for unauthenticated, mismatched ownership, and invalid studentId cases.

## Rollback Plan

Revert the two files to their previous unauthenticated state.
