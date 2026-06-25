---
name: fix-safe
description: Select and fix one high-value, high-confidence GitHub issue using OpenSpec, branch isolation, verification, Supabase/MCP gates, and PR workflow.
---

# Fix Safe

Use this skill to autonomously select and resolve one GitHub issue that has high value, high fix confidence, strong verification confidence, and acceptable regression risk.

## Mission

Select one issue, create an issue branch, create an OpenSpec proposal, implement the fix, verify it, sync and archive the OpenSpec change, commit, push, and open a pull request.

Do not commit directly to `main`, `master`, `production`, or release branches.

Prefer opening a pull request over directly closing an issue. Do not close the issue unless the PR is merged or the repository workflow explicitly allows closure.

## Required Gates

Review open GitHub issues and estimate:

- Fix Confidence: 0-10
- Verification Confidence: 0-10
- Business Value: 0-10
- Regression Risk: 0-10

Proceed only if:

- Fix Confidence >= 8.5
- Verification Confidence >= 8.5
- Regression Risk <= 4

If no issue qualifies, stop and report:

No issue met the confidence and verification thresholds required for autonomous resolution.

## Eligible Issues

Eligible issues include bugs, security vulnerabilities, RLS defects, backend defects, API defects, performance issues, reliability issues, data integrity issues, validation issues, error handling issues, type safety issues, testing gaps, build failures, dependency vulnerabilities, and documentation issues.

## Ineligible Issues

Do not select issues requiring major architecture redesign, undefined product decisions, large-scale refactors, broad framework migrations, major UI redesigns, significant workflow changes, speculative fixes, or guesswork about intended behavior.

## Security Rules

Security issues are eligible when root cause, impact, fix scope, verification path, and regression risk are understood.

Do not print, commit, expose, or log secrets, tokens, environment variables, Supabase keys, connection strings, API keys, or credentials.

## Supabase, RLS, and Database Rules

Supabase/RLS fixes are eligible only when the agent can fully apply and verify the change through working MCP/database access.

Before selecting any issue requiring migrations, RLS policy changes, functions, triggers, views, indexes, schema modifications, storage policies, or database changes of any kind, verify all of the following:

1. MCP connection is available
2. Database inspection works
3. Migration execution works
4. Post-migration verification works

If any check fails:

- Reject the issue
- Do not create a proposal
- Do not generate migrations
- Do not commit changes
- Do not attempt a partial fix
- Select another issue

Database issues may only be completed when migration executed successfully, database state was verified, relevant tests passed, and MCP verification completed.

## Destructive Database Guardrails

Do not perform destructive database actions unless explicitly required by the issue and justified in the OpenSpec proposal.

Treat these as high risk:

- drop table
- drop column
- truncate
- broad delete
- broad update
- policy weakening
- permission widening
- removing ownership, organization, or team constraints

If a database change could expose cross-user, cross-team, or cross-organization data, stop.

Prefer deny-by-default behavior.

## MCP Failure Rule

If MCP access fails during a database-related fix:

1. Stop immediately
2. Revert uncommitted database-related changes
3. Do not close the issue
4. Do not archive the OpenSpec change as completed
5. Select a different issue if operating autonomously

## Branch Management

Before creating the OpenSpec proposal, create a dedicated branch from the repository default branch.

Branch name format:

issue-<number>-<slug>

Examples:

- issue-42-fix-missing-rls-policy
- issue-187-prevent-org-data-leak
- issue-912-fix-null-reference-in-sync

Branch requirements:

- Include GitHub issue number
- Include a sanitized slug from the issue title
- Use valid git branch syntax
- Match the issue title as closely as possible
- Never work directly on main, master, production, or release branches

If branch creation fails, stop before modifying files.

## OpenSpec Proposal

Create a proposal containing:

- GitHub issue reference
- Root cause
- Proposed solution
- Scope
- Non-goals
- Risk assessment
- Verification plan
- Rollback plan

For database changes also include:

- Tables affected
- Policies affected
- Functions affected
- Migration plan
- MCP verification results

## Implementation

Implement the smallest complete fix.

Avoid opportunistic refactoring, unrelated cleanup, cosmetic changes, and scope expansion.

## Verification

Run focused validation first, then broader validation if appropriate.

Examples include unit tests, integration tests, E2E tests, type checking, linting, security scans, build validation, and database verification.

Verification must directly confirm that the issue is resolved.

After implementation, reassess:

- Fix Confidence
- Verification Confidence
- Regression Risk

If confidence falls below required thresholds:

- Revert changes
- Stop work
- Do not commit
- Do not open a PR
- Do not close the issue

## OpenSpec Sync and Archive

After successful verification:

1. Sync OpenSpec
2. Confirm implementation matches proposal
3. Archive the OpenSpec change

Never archive failed or incomplete work as completed.

## Commit

Before committing:

Review git diff
Confirm all changes relate to the selected issue
Remove unrelated modifications
Confirm current branch is the issue branch
Confirm tasks.md is fully complete
Confirm OpenSpec validation passed
Confirm the OpenSpec change was synced
Confirm the OpenSpec change was archived
Confirm the change no longer appears in active openspec/changes/

Do not commit if the OpenSpec change is still unarchived.

Commit message format:

fix: <issue summary> (#<issue number>)

Allowed prefixes:

- fix:
- security:
- perf:
- test:
- docs:

## Push and Pull Request

After verification and commit:

1. Push the issue branch
2. Create or update a pull request
3. Link the GitHub issue
4. Include OpenSpec proposal reference
5. Include verification results
6. Include risk assessment

PR title format:

[#<issue number>] <issue title>

Prefer using Fixes #<issue number> in the PR body so GitHub closes the issue after merge.

## Issue Closure

Do not close the issue just because a branch was pushed.

Prefer automatic closure through a merged PR.

Only close the issue manually if repository workflow explicitly allows it, the fix is merged or otherwise accepted, verification passed, OpenSpec was synced and archived, and no database verification is pending.

## Final Report

Report:

- Selected issue
- Issue score
- Root cause
- Why issue was selected
- Branch name
- Files changed
- Verification performed
- Test results
- OpenSpec proposal name
- Commit hash
- PR link or push result
- Issue closure status
- Remaining risks
- MCP verification status if applicable