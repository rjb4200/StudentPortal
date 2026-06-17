## MODIFIED Requirements

### Requirement: Central environment variable module
The system SHALL provide central environment variable configuration modules that export validated, typed accessors for all required environment variables. The modules SHALL separate public client-safe variables from server-only secrets.

#### Scenario: Module exports public env values
- **WHEN** any module imports `publicEnv` from `src/lib/env.ts`
- **THEN** it receives validated values for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` without needing to access `process.env` directly

#### Scenario: Module exports server-only env values
- **WHEN** a server-side module imports `serverEnv` from `src/lib/env.server.ts`
- **THEN** it receives a validated value for `SUPABASE_SERVICE_ROLE_KEY` plus the optional value for `RESEND_API_KEY`

#### Scenario: Client code blocked from importing server secrets
- **WHEN** a client component attempts to import `serverEnv` from `src/lib/env.server.ts`
- **THEN** the build fails because `server-only` is imported by the server environment module
