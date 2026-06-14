# Repository Instructions

- Remote: `https://github.com/rjb4200/StudentPortal.git`.
- Do not invent build, test, lint, framework, or package-manager commands until manifests/configs are added.
- When project files are added, update this file from executable sources first: manifests, lockfiles, CI, task runner config, and existing repo instructions.

## Stack

- **Next.js 15** (App Router) with React 18, Tailwind CSS 3
- **Supabase** project: `ejjsahtohaydoogtilgp` (NOT the old `dewuhmdgmoewoqmsflcw`)
- Deployed on **Vercel** with a daily cron: `GET /api/cron/sweep`
- `npm run build` is the verification command; no test suite exists yet.

## Environment Variables

All in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # public anon key
SUPABASE_SERVICE_ROLE_KEY         # secret — server-only, used by admin client
RESEND_API_KEY                    # email (Resend)
PUSHOVER_APP_TOKEN                # push notifications
PUSHOVER_USER_KEY                 # push notifications
```

## Supabase MCP

The MCP is project-scoped in `opencode.jsonc` — `project_ref=ejjsahtohaydoogtilgp`. Do NOT add a global Supabase MCP config elsewhere.

## Database Migrations

Migrations live in `supabase/migrations/` (numbered `.sql` files). **Every migration must also be applied live** via the `supabase_apply_migration` tool. Migrations are DDL + seed data combined — they run against the live Supabase project.

After any DDL change:
1. Run `supabase_generate_typescript_types`
2. Replace `src/lib/supabase/database.types.ts` with the output

## Supabase Clients (three patterns)

| File | Client | Key | Use |
|---|---|---|---|
| `src/lib/supabase/client.ts` | `createBrowserClient` | Anon | Client components, onboarding |
| `src/lib/supabase/server.ts` | `createServerClient` (cookies) | Anon | Server Components, API routes |
| `src/lib/supabase/admin.ts` | `createClient` (vanilla) | Service role | Server-only: auth admin, approveStudent |

## Auth & Access Control

- **Onboarding**: Anonymous access via `/onboarding`. Registration uses the `register_onboarding_student` RPC (SECURITY DEFINER, allows upsert of incomplete pending entries by email).
- **Student auth**: Students exist as `students` rows first (status `pending`). Admin approval calls `approveStudent()` in `src/lib/auth.ts` — creates a Supabase Auth user via admin client, sets `students.id = auth.users.id`.
- **Admin role**: Checked via `auth.jwt() -> 'user_metadata' -> 'role' = 'admin'` in RLS policies and middleware. Admin auth user: `rjb4200@gmail.com`.
- **Middleware** (`src/middleware.ts`): Protects `/admin` (admin role) and `/dashboard` (certified + not blacklisted + not expired). `/onboarding` is publicly accessible.

## RLS

All tables have RLS enabled. Admin policies use `user_metadata.role = 'admin'` — this is flagged by Supabase security advisors as a risk since `user_metadata` is user-editable, but it's the current pattern across all tables. Public reads are restricted to `is_active = true` rows for onboarding content.

## Onboarding Flow (fixed 4 steps)

Register → Legal → Resources → Quiz

All four steps are now database-driven (not hard-coded). Admin configuration is in Maintenance & Archive:
- **Quiz**: `quiz_rules` + `quiz_photos` (rule-before-question, retry on failure)
- **Registration fields**: `registration_fields` + `student_field_values`
- **Legal documents**: `legal_documents`
- **Resource library**: `resource_categories` + `resource_documents`
- **Messaging**: broadcasts in Daily Ops; fixed welcome/completion messages use `message_templates`

## OpenSpec (Spec-Driven Development)

- OpenSpec is installed globally: `npm install -g @fission-ai/openspec@latest`
- After global install/upgrade, run `openspec update` in the project to refresh AI instructions.
- Slash commands: `/opsx:propose`, `/opsx:apply`, `/opsx:archive`
- `.opencode/` — OpenCode-specific commands and skills (managed by `openspec update`)
- `openspec/specs/` — living specs organized by capability
- `openspec/changes/` — per-change proposals, specs, design, and tasks

## Tailwind

Custom `wfd-*` color palette: `wfd-crimson` (#B61C20), `wfd-charcoal` (#1C1C1E), `wfd-gold` (#D4AF37). UI components in `src/components/ui/` (Button, Card, Input, Badge, Modal).
