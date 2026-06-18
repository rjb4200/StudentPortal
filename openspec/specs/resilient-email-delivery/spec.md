# resilient-email-delivery Specification

## Purpose
Decouple transactional email delivery from critical state changes. Emails are best-effort — failures are logged but never crash or roll back the operation that triggered them.

## Requirements
### Requirement: Non-blocking email delivery
All transactional email sending via Resend SHALL be a best-effort, non-blocking side effect. A failure to deliver email SHALL NOT cause the calling operation to return an error response — the critical state change (DB mutation, auth creation) SHALL succeed independently of email delivery.

#### Scenario: Resend API unreachable during onboarding completion
- **WHEN** the onboarding-complete API creates an auth user and links it to the student row
- **AND** the Resend API is unreachable (DNS failure, network timeout)
- **THEN** the API still returns HTTP 200 with `{ success: true, password, email, isNewAccount }`
- **AND** the email failure is logged as a structured error to the console

#### Scenario: Resend API returns non-200 during admin approval
- **WHEN** an admin approves a student and the DB update succeeds
- **AND** the Resend API returns a 429 (rate limit) or 500 error
- **THEN** the approval API returns HTTP 200 with `{ success: true }`
- **AND** the Resend error status and body are logged

#### Scenario: Resend API times out during schedule action
- **WHEN** an admin approves/rejects a schedule and the DB update succeeds
- **AND** the Resend API connection hangs (no response within 5 seconds)
- **THEN** the schedule action API returns HTTP 200 with `{ success: true }`
- **AND** the timeout is logged

### Requirement: Shared Resend email utility
All Resend API calls SHALL go through a single shared `sendEmail()` utility in `src/lib/email.ts`. The utility SHALL accept `to`, `subject`, `html`, and optional `from` parameters. It SHALL return `{ ok: boolean; error?: string }` instead of throwing. It SHALL apply a configurable timeout (default 5 seconds) via AbortController.

#### Scenario: Successful email send
- **WHEN** `sendEmail()` is called with valid parameters and the Resend API is healthy
- **THEN** it returns `{ ok: true }`

#### Scenario: Timeout on hung connection
- **WHEN** `sendEmail()` is called and the Resend API does not respond within the timeout window
- **THEN** the AbortController aborts the fetch and the function returns `{ ok: false, error: "Email send timed out after 5s" }`

#### Scenario: Non-200 response from Resend
- **WHEN** `sendEmail()` is called and Resend returns a non-2xx status
- **THEN** the function returns `{ ok: false, error: "Resend returned <status>" }`
- **AND** the response body is logged but not returned to the caller
