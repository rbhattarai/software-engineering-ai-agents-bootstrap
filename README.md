# software-engineering-ai-agents-bootstrap

Bootstrap an AI-agentic SDLC harness around any software project — new or existing, any stack.
This repo is a **Claude Code plugin marketplace** hosting the `se-harness` plugin.

Plan and research log: [`brainstorm.md`](./brainstorm.md) (Part A = plan, Part B = research).

## Status

**Phases 0–2 + A5 implemented.** Phase 0/A5: the seven "improvements over the literal
spec" from `brainstorm.md` §A5 (table below). Phase 1: `/harness-init` — intake interview
(new-vs-existing, topology, methodology/stack/devops/cloud, org-context round) rendering all
per-project artifacts idempotently via `scripts/render-block.sh` (tested: create /
update-preserving-hand-edits / prepend / idempotent re-run). Phase 2: `/harness-scan` —
brownfield detection: deterministic evidence collector (`scripts/scan-evidence.sh`, read-only,
bounded; tested against a synthetic repo) + `stack-detector` skill (usage-beats-listing
reasoning, org-context detection incl. private registries and implicit conventions, low
confidence → user question, never silent) + confirm-then-merge back through the same splicer.
Phase 3: `/harness-bootstrap` — recommender over `registry/recommendations.json` (profile→
plugin mappings with honest gaps, never-invent-a-plugin-name rule), opt-in multiSelect
installation (plugin / cli / mcp kinds, `pending-manual` fallback when the CLI is absent),
the 11-agent SDLC roster (architect, story-writer, implementers, db-engineer, unit/integration
testers, e2e planner/generator/healer, release-manager — narrow tools each), `.mcp.json`
merge template, and lockfile recording (installed/pending/declined). Phase 4: the memory
tiers — `wiki-ingest`/`wiki-query`/`wiki-lint` skills (Karpathy triad: synthesis-only pages
with provenance footers, contradiction blocks, index+log discipline), `memory-keeper`
conventions (append-only tier 2, typed causal links `solves`/`causes`/`builds-on`, promotion
rules), and `scripts/memory-log-commit.sh` (PostToolUse hook auto-logging commits/PRs/merges
to the daily log; tested — the escaped-quote JSON fix from this round also hardened
gate-check.sh against under-blocking). Phase 5: `/harness-goal` fully wired — supervisor
orchestration over the agent roster (grill → deep-dive → REQ ⛔ → story/tests → design →
worktree fan-out (db → backend ∥ frontend) → unit/integration → e2e trio → evidence ⛔ PR →
compose verify → ⛔ deploy → memory close-out), backed by `requirement-grill` skill,
`new-requirement.sh` (REQ scaffolding, YAML-safe escaping) and `worktree-task.sh` (isolated
task worktrees; refuses dirty removal) — both tested. Phase 6: `/harness-sync` — four-axis
drift detection (profile re-scan, recommendation diff vs. lockfile with declined-items
memory, template-hash drift via `template-hash.sh` [tested], memory health) → diff-first
report → confirmed refresh of generated blocks only, `syncs:` history in the lockfile.

**v1 build plan (Phases 0–6) complete.** Remaining: Phase 7 / v2+ (multi-repo tiers 2–3,
`harness-export`, web UI, swarm) and hardening (jq-based hook parsing, CI validation of
registry names against live marketplaces, real-world end-to-end dogfooding).

| A5 improvement | Implemented by |
|---|---|
| 1. Progressive-disclosure context injection (not feed-everything) | `plugins/se-harness/skills/context-injector/` + `scripts/inject-context.sh` (UserPromptSubmit hook) |
| 2. Refined requirements in `.harness/requirements/` (committed), not `.temp` | `templates/requirement.md` + `commands/harness-goal.md` step 3 |
| 3. Secrets split: committed profile vs gitignored env | `templates/profile.yaml`, `templates/env.harness.example`, `templates/gitignore.harness` |
| 4. Jira/XRay as system of record via MCP | `commands/harness-goal.md` step 4 |
| 5. HITL gates only at irreversible steps | `commands/harness-goal.md` gates (steps 3/7/9) + `scripts/gate-check.sh` (PreToolUse hook) |
| 6. Video/NAS ingestion deferred to v2 | encoded in `templates/profile.yaml` (`sources.deferred`) |
| 7. Org libraries as generation target (compose-first) + machine-checkable validation | `templates/AGENTS.md.tmpl` org section + `scripts/org-validate.sh` (PostToolUse hook) |

## Layout

```
.claude-plugin/marketplace.json      # this repo IS a marketplace
plugins/se-harness/                  # the harness plugin
  .claude-plugin/plugin.json
  commands/
    harness-init.md                  # Phase 1: intake interview → renders all per-project artifacts
    harness-scan.md                  # Phase 2: brownfield detect → confirm → merge into profile
    harness-bootstrap.md             # Phase 3: recommend → opt-in install → wire → lockfile
    harness-goal.md                  # Phase 5: the goal loop — supervisor over the agent roster, 3 HITL gates
    harness-sync.md                  # Phase 6: four-axis drift detection → confirmed refresh
  agents/                            # 11-agent SDLC roster (narrow tools per agent)
  skills/
    context-injector/SKILL.md
    stack-detector/SKILL.md          # evidence-based detection rules for /harness-scan
    memory-keeper/SKILL.md           # tier-2 conventions: daily/topics/scratchpad, typed links
    wiki-ingest/  wiki-query/  wiki-lint/   # tier-3 domain wiki (Karpathy triad)
  hooks/hooks.json
  scripts/                           # hooks + render-block.sh (splicer) + scan-evidence.sh (collector)
registry/recommendations.json        # profile→plugin mappings (recommender data; honest gaps)
templates/                           # profile/env/requirement/AGENTS/CLAUDE/mcp + memory/ seeds
```

## Install (once published)

```
/plugin marketplace add <owner>/software-engineering-ai-agents-bootstrap
/plugin install se-harness
```

> Note: the Claude Code plugin/hook schema evolves quickly — verify manifests against the
> [official plugin docs](https://code.claude.com/docs/en/plugins-reference) before releasing.
