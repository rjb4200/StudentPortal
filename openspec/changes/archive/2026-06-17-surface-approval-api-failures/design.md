## Context

The Daily Ops approval flow currently sends `POST /api/admin/approve-student` from `src/components/admin/daily-ops.tsx`, awaits the fetch, and reloads data without checking the HTTP status or JSON response. The approval API route already returns JSON errors for forbidden access, missing student IDs, and missing student records, but the UI ignores them. The route also performs the student status update without checking the Supabase update result.

Successful approval behavior is already defined across existing specs: approval certifies the student, sets `access_until` to 120 days, and sends the account-approved email. This change should preserve that behavior while making failures explicit.

## Goals / Non-Goals

**Goals:**

- Make failed approval API calls visible to admins in Daily Ops.
- Prevent the UI from refreshing or implying success unless the API confirms success.
- Return useful server-side errors when the approval status update fails.
- Preserve the existing successful approval path, including account-approved email delivery.

**Non-Goals:**

- Redesign the Daily Ops layout.
- Add a toast framework or new UI dependency.
- Change database schema, RLS policies, or approval authorization rules.
- Change schedule action behavior, except as a possible future follow-up.

## Decisions

1. Use local component state for approval errors.

   The smallest appropriate UI change is an inline error string in `DailyOps`, rendered near the Action Required card or the affected approval row. This avoids adding a global notification system for one bug fix.

   Alternative considered: native `alert()`. Rejected because the existing admin UI mostly uses inline error state in configuration panels, and alerts are harder to test and easy to dismiss without context.

2. Treat success as `response.ok` plus `body.success === true`.

   The API should be considered successful only when the HTTP response is OK and the JSON payload explicitly confirms success. Non-OK responses and malformed or missing success payloads should produce an admin-facing error.

   Alternative considered: rely only on `response.ok`. Rejected because the issue specifically calls out validating the response body as well as the HTTP status.

3. Keep failed approvals in the queue.

   The UI should call `loadAll()` only after confirmed success. On failure, the pending student remains visible and the admin sees the error message.

   Alternative considered: reload after every response to reflect any partial server-side changes. Rejected because it can hide failures and recreates the current confusing behavior.

4. Return API errors for failed student updates.

   The approval route should inspect the Supabase update result and return a non-OK JSON response with an error message if the update fails. This gives the UI a reliable failure contract.

   Alternative considered: throw and rely on Next.js error handling. Rejected because the UI needs structured JSON errors for troubleshooting.

5. Do not roll back approval for email delivery failures in this change.

   Approval and email are currently sequential but not transactional. The core issue is the UI ignoring API failures, and the safest minimal fix is to validate the certification update. If email failure visibility is desired, it should be handled deliberately as a separate policy decision.

   Alternative considered: make email failure cause approval failure. Rejected because the student may already be certified by then, and adding rollback behavior would expand scope and risk.

## Risks / Trade-offs

- API response parsing could fail for unexpected non-JSON responses -> catch parsing/runtime errors and show a generic approval failure message.
- Inline errors can persist after retry success if not cleared -> clear the approval error before a new attempt and after confirmed success.
- The schedule action handler has a similar unchecked fetch pattern -> leave it unchanged for this issue unless a separate bug is filed.
