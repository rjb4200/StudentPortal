Use the fix-safe skill.

Review this repository's open GitHub issues and select exactly one qualifying issue.

Follow the fix-safe workflow completely:

- Do not work on main, master, production, or release branches.
- Create a branch named issue-<number>-<slug>.
- Use OpenSpec to create a proposal before implementation.
- Do not select Supabase, RLS, migration, or database issues unless MCP access works and database inspection, migration execution, and post-migration verification all work.
- Do not expose secrets, tokens, env vars, Supabase keys, API keys, or connection strings.
- Implement the smallest complete fix.
- Verify the fix.
- Sync and archive the OpenSpec change only after successful verification.
- Commit only related files on the issue branch.
- Push the issue branch.
- Open a pull request.
- Prefer using Fixes #<issue number> in the PR body.
- Do not close the issue unless the PR is merged or the repository workflow explicitly allows it.

Final report must include selected issue, branch name, OpenSpec proposal name, files changed, verification results, commit hash, PR link or push result, issue closure status, remaining risks, and MCP verification status if applicable.
