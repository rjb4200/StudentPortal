## Why

Fifty-two of 71 `process.env` accesses use TypeScript non-null assertions (`!`) with zero validation. If any of the three Supabase environment variables is missing or misnamed at deploy time, the app crashes at runtime with a cryptic `TypeError: Cannot read properties of undefined` — giving no indication which variable is missing or where to fix it. Additionally, most API routes bypass the shared Supabase client modules and create clients inline, duplicating the same unsafe pattern across 13 route files.

## What Changes

- Create `src/lib/env.ts` — a central environment validation module that validates required variables at import time and throws clear, actionable error messages naming the specific missing variable and instructing where to set it.
- Split into public (`NEXT_PUBLIC_*`) and server-only exports. The server-only section uses the `server-only` npm package to prevent accidental client-side access to secrets like `SUPABASE_SERVICE_ROLE_KEY`.
- Update the three shared Supabase client modules (`client.ts`, `server.ts`, `admin.ts`) to import validated env values instead of using `process.env.X!` directly.
- Refactor all 13 API route files that create Supabase clients inline to import from the shared modules instead — eliminating the duplicated unsafe env access pattern and reducing total `process.env` access points from 71 to ~8.
- Update middleware and auth callback route to use the validated env module.
- Add `server-only` as an npm dependency.
- Update `.env.example` to clearly mark which variables are required vs optional and add the env module's error message format as documentation.
- Remove the unused `ONBOARDING_TOKEN` from `.env.example` (it is referenced nowhere in the codebase).

## Capabilities

### New Capabilities

- `env-validation`: Central environment variable validation that fails fast with clear, actionable error messages. Separates public client variables from server-only secrets using the `server-only` package.

### Modified Capabilities

None. This is an internal quality and reliability change — no user-facing behavior or spec-level requirements change.

## Impact

- **New file**: `src/lib/env.ts`
- **New dependency**: `server-only` (npm)
- **Files refactored**: 3 Supabase client modules, middleware, auth callback, 13 API route files (~20 files total)
- **Files updated**: `.env.example`
- **No database migrations, no API contract changes, no UI changes**
