---
description: Bootstrap the AI harness for this project — interview (new) or detect+confirm (existing), then generate profile, env, memory scaffold, org rules, and AGENTS.md/CLAUDE.md.
argument-hint: [--update]
---

# /harness-init — project intake & bootstrap

Set up the se-harness around the current repository. Interview the user, then generate all
per-project artifacts. **Idempotent**: re-running updates only generated content, never
hand-written files.

## Step 0 — Guard
If `.harness/profile.yaml` already exists and `$ARGUMENTS` does not contain `--update`:
show the existing profile summary and ask whether to update it or abort. Never silently
re-initialize.

## Step 1 — New or existing?
Look at the repo (any source files beyond scaffolding?). Propose your conclusion and confirm
with the user via AskUserQuestion — don't assume.

## Step 2 — Topology
Check for workspace markers: `pnpm-workspace.yaml`, `nx.json`, `turbo.json`, `lerna.json`,
`*.sln`, Maven multi-module `pom.xml` (`<modules>`), `go.work`, `WORKSPACE`/`MODULE.bazel`.
- Markers found → propose **mono-repo**, list detected units, confirm.
- Ask whether this repo is part of a **multi-repo product** (sibling repos forming one system).
  If yes: record the workspace meta-repo URL (or note "workspace manifest TBD") in the profile.
- Otherwise → **single**.

## Step 3 — Interview (AskUserQuestion, batch related questions, max 4 per call)
Ask only what wasn't detected. Cover:
1. **Methodology**: BMAD (roles/stakeholders, enterprise) / Spec Kit (greenfield, spec-first) /
   OpenSpec (brownfield, delta-based). Recommend based on project type; user decides.
2. **Stack** — *new projects only* (existing projects get this from `/harness-scan`):
   offer presets first — `Python (FastAPI + Postgres)`, `Node + React (Express/Postgres/Redis)`,
   `Node + Angular`, `Other (specify)` — then confirm databases/messaging/devops details.
3. **DevOps + cloud**: CI system, container approach (default docker-compose), cloud target
   (aws / azure / gcp / vercel / none-yet).
4. **Non-code sources**: Jira project key, Confluence space keys, SharePoint sites (each
   optional — record "" when not used).

## Step 4 — Organization context (required before AGENTS.md/CLAUDE.md is finalized)
Ask explicitly — for new projects this is the only source; for existing projects collect what
the user knows now (Phase 2 `/harness-scan` will verify/extend it):
1. **Internal libraries** the company built (name, registry/scope, purpose) — these become
   *generation targets* (compose-first), not just context.
2. **Preferred/mandated libraries** — "use X, never Y" pairs with reasons.
3. **Coding conventions/guidelines** — inline rules and/or a Confluence/SharePoint URL
   (the wiki-ingest skill will pull the URL's content into domain memory later).
None of these are required — record empty lists if the org has none; don't nag.

## Step 5 — Generate artifacts
Order matters; use the exact mechanics below.

1. **`.harness/profile.yaml`** — render from `${CLAUDE_PLUGIN_ROOT}/../../templates/profile.yaml`
   with all interview answers. Never put secrets here.
2. **`.env.harness`** — copy `templates/env.harness.example` **only if `.env.harness` doesn't
   already exist**; leave existing files untouched. Tell the user which vars to fill for the
   sources they named.
3. **`.gitignore`** — append each line of `templates/gitignore.harness` that isn't already
   present (grep before append; create `.gitignore` if missing).
4. **Memory scaffold** (skip any file that already exists):
   ```
   .harness/memory/MEMORY.md        (from templates/memory/MEMORY.md)
   .harness/memory/SCRATCHPAD.md    (from templates/memory/SCRATCHPAD.md)
   .harness/memory/daily/           (empty dir, .gitkeep)
   .harness/memory/wiki/index.md    (from templates/memory/wiki-index.md)
   .harness/memory/wiki/log.md      (from templates/memory/wiki-log.md)
   .harness/requirements/           (empty dir, .gitkeep)
   ```
5. **`.harness/org-rules.txt`** — one line per banned pair from the org answers:
   `banned:<never>:use <use> (<reason>)`. Empty file if none (the org-validate hook no-ops).
6. **AGENTS.md and CLAUDE.md** — render the *inner* content of
   `templates/AGENTS.md.tmpl` / `templates/CLAUDE.md.tmpl` (fill every `{{placeholder}}` from
   the profile; drop sections whose data is empty; **do not include the marker lines** — the
   splice script owns them). Write each rendered block to a temp file, then:
   ```
   bash ${CLAUDE_PLUGIN_ROOT}/scripts/render-block.sh AGENTS.md <temp-agents-block>
   bash ${CLAUDE_PLUGIN_ROOT}/scripts/render-block.sh CLAUDE.md <temp-claude-block>
   ```
   This is the ONLY way to touch these files — never edit them directly, so hand-written
   content outside the markers survives.
7. **`.harness/agentstack.lock`** — JSON: `se_harness` version (from plugin.json),
   `initialized`/`updated` ISO dates, `profile` echo of key choices (methodology, stack,
   cloud, topology), `components: {}` (Phase 3 fills this).

## Step 6 — Report & next steps
Summarize what was created vs. skipped (already existed). Then:
- **Existing project** → "run `/harness-scan` to detect stack/devops/org conventions from the
  code" (Phase 2 — if not yet available, say so and note the profile can be completed manually).
- Both → next: Phase 3 bootstrap (methodology + stack plugins), then `/harness-goal <goal>`.
- Remind: fill `.env.harness`, commit `.harness/` + AGENTS.md/CLAUDE.md, DON'T commit `.env.harness`.
