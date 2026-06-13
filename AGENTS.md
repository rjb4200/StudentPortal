# Repository Instructions

- Remote: `https://github.com/rjb4200/StudentPortal.git`.
- Do not invent build, test, lint, framework, or package-manager commands until manifests/configs are added.
- When project files are added, update this file from executable sources first: manifests, lockfiles, CI, task runner config, and existing repo instructions.

## OpenSpec (Spec-Driven Development)

- OpenSpec is installed globally: `npm install -g @fission-ai/openspec@latest`
- After global install/upgrade, run `openspec update` in the project to refresh AI instructions.
- Slash commands: `/opsx:propose`, `/opsx:apply`, `/opsx:archive`
- `.opencode/` — OpenCode-specific commands and skills (managed by `openspec update`)
- `openspec/specs/` — living specs organized by capability
- `openspec/changes/` — per-change proposals, specs, design, and tasks
