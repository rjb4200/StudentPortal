## Context

The codebase has 71 `process.env` accesses across 26 files. Fifty-two of these use the TypeScript non-null assertion operator (`!`), providing zero runtime validation. The three Supabase variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) account for all 52 unsafe accesses. Meanwhile, `RESEND_API_KEY` and the Pushover tokens are already guarded with `if` checks — a good pattern that was never applied to the Supabase vars.

Additionally, 13 API route files bypass the three shared Supabase client modules and create client instances inline, duplicating the same `process.env.X!` pattern. Six admin routes create two clients each (anon + service-role), accounting for 24 of the 52 unsafe accesses.

The `server-only` npm package is not installed. The `ONBOARDING_TOKEN` variable exists in `.env.local` and `.env.example` but is never read by any code.

## Goals / Non-Goals

**Goals:**
- Validate all required environment variables at module import time with clear, actionable error messages
- Reduce `process.env` access points from 71 to ~8 by centralizing Supabase client env access in the shared modules
- Refactor all API routes to use shared Supabase client modules instead of creating clients inline
- Protect server-only secrets from accidental client-side bundling via the `server-only` package
- Remove dead configuration (`ONBOARDING_TOKEN`)
- Document all required variables clearly in `.env.example`

**Non-Goals:**
- Changing how Next.js loads `.env.local` (Next.js handles this natively)
- Adding runtime secret rotation or a secrets manager
- Changing the Supabase client configuration (still uses same keys, same settings)
- Adding tests (no test suite exists)
- Changing any user-facing behavior or API contracts

## Decisions

### Decision 1: Single file with two export objects vs separate modules

Use a single `src/lib/env.ts` file that constructs two typed export objects: `publicEnv` and `serverEnv`.

```ts
// src/lib/env.ts

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Set it in .env.local or your Vercel project settings.`
    );
  }
  return value;
}

export const publicEnv = {
  SUPABASE_URL: required('NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
} as const;

// Server-only block — protected by 'server-only' import
import 'server-only';

export const serverEnv = {
  SUPABASE_SERVICE_ROLE_KEY: required('SUPABASE_SERVICE_ROLE_KEY'),
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  PUSHOVER_APP_TOKEN: process.env.PUSHOVER_APP_TOKEN,
  PUSHOVER_USER_KEY: process.env.PUSHOVER_USER_KEY,
} as const;
```

**Why**: A single file keeps all env concern in one place, easy to audit. The `import 'server-only'` between the two blocks acts as a compile-time gate — any client component that imports the file will fail at the `server-only` boundary, protecting secrets. The `publicEnv` object is at the top (before the gate) so it can be imported by client code.

**Alternatives considered**:
- `src/lib/env/public.ts` + `src/lib/env/server.ts` — more files for minimal benefit; harder to keep in sync.
- Using `next/constants` or Next.js `runtime` config — adds indirection; Next.js already loads `.env.local`.
- Validating at app startup (instrumentation hook) — cannot surface errors during build unless the hook is triggered; import-time validation is simpler and works identically in dev and production.

### Decision 2: Import-time validation vs lazy getter

All required variables are validated when the module is first imported (at module evaluation time), not lazily on access.

**Why**: Import-time validation fails immediately when the app starts or the build runs, surfacing errors before any request is handled. This is the "fail fast" principle. The module is imported by nearly every page and route handler, so validation occurs at cold start — if a variable is missing, the deploy fails visibly instead of producing a cryptic 500 error on some later request.

**Alternatives considered**:
- Lazy getter (`env.NEXT_PUBLIC_SUPABASE_URL` throws on first access) — delays the error, harder to debug and risks a partial deploy.
- Build-time validation with a script — requires a separate build step, easy to forget.

### Decision 3: `server-only` package for client/server separation

Add the `server-only` npm package and place its import between `publicEnv` and `serverEnv` in the module.

**Why**: Next.js treats `import 'server-only'` as a build boundary. Any client component or page that imports from `serverEnv` will fail at build time with a clear Next.js error. This prevents accidental leakage of `SUPABASE_SERVICE_ROLE_KEY` into browser bundles. The package is maintained by the Next.js team and weighs ~0 KB.

**Alternatives considered**:
- Naming convention (`env.server.ts`) — Next.js doesn't enforce this; purely convention-based.
- `NEXT_PUBLIC_` prefix convention — already in use, but `SUPABASE_SERVICE_ROLE_KEY` intentionally lacks the prefix. The `server-only` guard adds a compile-time backstop.
- Not separating — any developer could accidentally import the secret in a client component without realizing it.

### Decision 4: Refactor API routes to use shared modules

All API routes that currently inline Supabase client creation will be refactored to import from the shared modules. The three shared modules (`client.ts`, `server.ts`, `admin.ts`) will receive their env values from the validated env module.

This eliminates the "same 4 lines repeated 13 times" anti-pattern. The admin routes (which create dual clients) will import both `createServerClient` from `server.ts` and `createAdminClient` from `admin.ts`.

For routes that need a server client but currently inline it with a different cookie pattern than `server.ts` (e.g., the auth callback creates its own `createServerClient` with custom cookie handlers), those routes will keep their custom cookie configuration but read the env vars from `publicEnv`.

**Why**: Reduces unsafe `process.env` accesses from 52 to ~6 (only in the env module and shared clients). Makes future env changes require touching one file instead of 20.

### Decision 5: Keep optional vars unvalidated

`RESEND_API_KEY`, `PUSHOVER_APP_TOKEN`, and `PUSHOVER_USER_KEY` remain optional — the existing `if` guards in `email.ts` and `pushover.ts` already handle missing values gracefully (early return with `console.warn`). The env module exposes them as `string | undefined`.

**Why**: These services are supplementary (notifications). The app functions without them. Making them required would break local development for contributors who don't have Pushover/Resend accounts.

## Risks / Trade-offs

- **[Risk] Import-time side effects may surprise developers** → The `required()` function throws during module evaluation. Mitigation: The error message is explicit about which variable is missing and where to set it. This pattern is common in Next.js projects (e.g., `@t3-oss/env-nextjs`).
- **[Risk] `server-only` adds a new dependency** → Mitigation: It is maintained by the Next.js team, zero runtime weight, and widely used. Equivalent to `import 'server-only'` in any server component.
- **[Risk] Refactoring 13 API routes may introduce regressions** → Mitigation: The refactoring is mechanical — replacing inline client creation with an import. The shared modules already configure clients identically (same URL, same key, same options). Build verification (`npm run build`) catches type errors. Each route can be verified individually.
- **[Trade-off] `publicEnv` uses different property names than `process.env`** → `publicEnv.SUPABASE_URL` vs `process.env.NEXT_PUBLIC_SUPABASE_URL`. Mitigation: The shorter names are cleaner. The mapping is documented in the env module source.
