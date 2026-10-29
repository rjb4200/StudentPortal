## Context

The TEI registration page uses local, presence-only checks to move through its four steps. The complete Zod schema is evaluated only by the final API request, and its response currently retains only the first error message. MOU template loading suppresses failures, so an empty MOU snapshot can reach final validation.

## Goals / Non-Goals

**Goals:**
- Reuse the authoritative shared registration schema for client-side step validation.
- Keep server validation authoritative and return structured error metadata for unexpected or stale client state.
- Prevent signed MOU submissions when the rendered template is unavailable.

**Non-Goals:**
- Change registry approval, MOU skip, or database persistence behavior.
- Add database migrations or alter registration data fields.

## Decisions

### Validate partial payloads by building the complete registration shape

The page will construct the same registration payload used at submission and validate the relevant nested object for the active step. Class validation will include the existing date-range rule. This avoids a second, drifting client-only rule set.

Alternative: duplicate individual field constraints in the page. Rejected because validation rules would diverge from the API schema.

### Return validation issues with paths

The API will return a stable error payload containing a readable fallback message and normalized issue path/message pairs. The page will map top-level paths (`site`, `instructor`, `class`, `mou`) to form steps and retain messages by path for rendering.

Alternative: parse generic error strings in the client. Rejected because messages are not a stable API contract and do not reveal fields reliably.

### Treat a missing MOU as a blocking state

Template fetch and rendering failures will be visible in step 4. Signed submission will remain disabled until a rendered body is available; the separate skip path remains available because it does not create a signed MOU snapshot.

## Risks / Trade-offs

- Client and server schema imports can increase client bundle size → validate only the required schema fragments and retain server validation.
- A stale deployment can still bypass client checks → structured API errors route the user to the failing step.
- Existing MOU template configuration may be absent → provide an explicit recovery message instead of an opaque validation failure.

## Migration Plan

Deploy as a backward-compatible UI and API response enhancement. Existing clients continue using the readable `error` property; updated clients use `issues` when present. Rollback consists of redeploying the previous application version.
