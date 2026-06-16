# env-validation Specification

## Purpose
TBD - created by archiving change validate-env-vars. Update Purpose after archive.
## Requirements
### Requirement: Central environment variable module
The system SHALL provide a central environment variable configuration module at `src/lib/env.ts` that exports validated, typed accessors for all required environment variables. The module SHALL separate public client-safe variables from server-only secrets.

#### Scenario: Module exports public env values
- **WHEN** any module imports `publicEnv` from `src/lib/env.ts`
- **THEN** it receives validated values for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` without needing to access `process.env` directly

#### Scenario: Module exports server-only env values
- **WHEN** a server-side module imports `serverEnv` from `src/lib/env.ts`
- **THEN** it receives validated values for `SUPABASE_SERVICE_ROLE_KEY` plus optional values for `RESEND_API_KEY`, `PUSHOVER_APP_TOKEN`, and `PUSHOVER_USER_KEY`

#### Scenario: Client code blocked from importing server secrets
- **WHEN** a client component attempts to import `serverEnv` from `src/lib/env.ts`
- **THEN** the build fails because `server-only` is imported in the server section of the module

### Requirement: Clear validation errors for missing variables
The system SHALL validate all required environment variables at module import time. If a required variable is missing or empty, the system SHALL throw an Error with a message that names the specific missing variable and instructs the developer where to set it.

#### Scenario: Missing required public variable
- **WHEN** `NEXT_PUBLIC_SUPABASE_URL` is not set and the env module is imported
- **THEN** the system throws an Error with the message: "Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL. Set it in .env.local or your Vercel project settings."

#### Scenario: Missing required server secret
- **WHEN** `SUPABASE_SERVICE_ROLE_KEY` is not set and the env module is imported by server code
- **THEN** the system throws an Error with the message: "Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY. Set it in .env.local or your Vercel project settings."

#### Scenario: All required variables present
- **WHEN** all required environment variables are set
- **THEN** the env module exports their values without throwing

### Requirement: Shared Supabase clients use validated env
The three shared Supabase client modules (`src/lib/supabase/client.ts`, `server.ts`, `admin.ts`) SHALL import their environment variables from the central env module instead of using `process.env` non-null assertions directly.

#### Scenario: Browser client uses validated env
- **WHEN** `createClient()` is called from `src/lib/supabase/client.ts`
- **THEN** it reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the validated `publicEnv` export

#### Scenario: Server client uses validated env
- **WHEN** `createServerClient()` is called from `src/lib/supabase/server.ts`
- **THEN** it reads values from the validated `publicEnv` export

#### Scenario: Admin client uses validated env and server-only protection
- **WHEN** the admin client module is imported
- **THEN** it reads `SUPABASE_SERVICE_ROLE_KEY` from the validated `serverEnv` export, which is protected by `server-only`

### Requirement: API routes use shared Supabase client modules
All API route files that create Supabase clients SHALL import from the shared client modules (`src/lib/supabase/server.ts` or `src/lib/supabase/admin.ts`) instead of creating clients inline with direct `process.env` access.

#### Scenario: Admin API route uses shared admin client
- **WHEN** an admin API route needs a service-role client
- **THEN** it imports `createAdminClient` from `src/lib/supabase/admin.ts` instead of calling `createClient(process.env.SUPABASE_SERVICE_ROLE_KEY!, ...)` inline

#### Scenario: Notification API route uses shared server client
- **WHEN** a notification API route needs to verify an auth session
- **THEN** it imports `createServerClient` from `src/lib/supabase/server.ts` instead of creating a server client inline

#### Scenario: No API route accesses process.env for Supabase vars
- **WHEN** any API route file is inspected
- **THEN** it contains zero direct accesses to `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, or `SUPABASE_SERVICE_ROLE_KEY` via `process.env`

