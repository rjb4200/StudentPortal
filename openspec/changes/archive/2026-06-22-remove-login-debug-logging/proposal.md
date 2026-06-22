# Remove Login Debug Logging

## Why

GitHub issue #116 reports that the public login flow still contains development `console.log` statements that print authentication/session and student lookup details in the browser console. This is production-facing auth code and should not emit account or student state during normal use.

## What Changes

- Remove debug-only `console.log` statements from `src/app/(public)/login/page.tsx`.
- Remove debug-only login queries that exist solely to support those logs.
- Preserve existing student login, admin login, and status-message behavior.

## GitHub Issue

- Fixes #116: Remove debug logging from login flow

## Root Cause

Temporary diagnostic logging and a broad debug student lookup were left in the student login handler after account-linking troubleshooting.

## Proposed Solution

Delete the debug `getSession`/sample student lookup and associated `console.log` calls while keeping the actual authenticated student lookup and redirect/status handling unchanged.

## Scope

- Public login page student login handler.
- Authentication OpenSpec behavior for no debug console output during login.

## Non-Goals

- No database, Supabase, RLS, migration, or schema changes.
- No changes to login routing, role checks, status messages, or password reset behavior.
- No changes to server-side operational error logging outside the public login flow.

## Risk Assessment

- Regression risk is low because the removed code is debug-only and not used for control flow.
- Removing the extra sample student query slightly reduces login work and data exposure in the browser console.

## Verification Plan

- Search the login page to confirm the removed debug `console.log` statements are gone.
- Run `openspec validate remove-login-debug-logging`.
- Run `npm run build` to confirm type/lint/build validity.

## Rollback Plan

Revert the login page and OpenSpec changes from this commit if the removal unexpectedly affects login behavior.
