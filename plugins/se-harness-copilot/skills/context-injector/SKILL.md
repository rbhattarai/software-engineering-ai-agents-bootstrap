---
name: context-injector
description: Budgeted, progressive-disclosure memory context for every request. Use when deciding what project memory to load — never bulk-load memory files; follow the budget table and retrieve the rest on demand.
---

# Context Injector

Doctrine (brainstorm.md A5 #1): **do not feed everything on every request.** Three layers:

1. **Always loaded (cheap index)** — AGENTS.md/CLAUDE.md generated blocks + the one-line-per-entry
   index in `.harness/memory/MEMORY.md`. These tell you *what exists*, not the content.
2. **Budgeted hot set (injected per turn)** — assembled by `scripts/inject-context.sh` on
   UserPromptSubmit, priority order with hard caps (~16K chars total, agentmemory pattern):

   | Priority | Source | Cap |
   |---|---|---|
   | 1 | `.harness/memory/SCRATCHPAD.md` (open items) | 2K |
   | 2 | Active requirement (`.harness/requirements/*.md` with status ≠ done) | 2K |
   | 3 | Today's daily log tail | 3K |
   | 4 | `MEMORY.md` (head + tail if over cap) | 4K |
   | 5 | Yesterday's daily log tail | 3K |

3. **Retrieved on demand (never pre-loaded)** — when the task actually needs it:
   - code structure → query the code-graph MCP tools (impact, callers, search)
   - domain knowledge → read the specific `.harness/memory/wiki/` page the index points to
   - history → grep daily logs / follow `[[wiki-links]]`

## Rules
- If the budget is exhausted, drop from priority 5 upward — never truncate priority 1.
- Cite which memory file a claim came from when it influences a decision.
- If the index references a file that doesn't exist, flag it (stale index) instead of guessing.
- Write-backs (new learnings) go to the daily log at task end — not into the always-loaded index
  unless genuinely long-term (then add a one-line index entry).
