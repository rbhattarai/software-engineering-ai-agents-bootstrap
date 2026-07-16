---
name: memory-keeper
description: Conventions for writing session/decision memory (tier 2) — daily logs, topics, scratchpad, typed causal links, promotion to the long-term index. Use at task end, after significant decisions/fixes, and when deciding where a learning belongs.
---

# Memory Keeper (tier 2 — append-only session/decision memory)

`.harness/memory/` is the project's committed, human-readable record. It is **append-oriented**:
history is never rewritten (that's the wiki's job for domain knowledge).

## Where things go
| What | Where |
|---|---|
| What happened today (work, decisions, dead ends) | `daily/YYYY-MM-DD.md` — append |
| Recurring theme across days (auth, flaky-tests, perf) | `topics/<topic>.md` + backlink `Daily: [[YYYY-MM-DD]]` |
| Open action items | `SCRATCHPAD.md` (add/complete; keep < ~20 lines) |
| Durable fact worth loading every session | one-line entry in `MEMORY.md` index → detail in a topic file |
| Domain knowledge from external sources | NOT here — wiki-ingest |

## Typed causal links (B12 borrow — graph semantics, no database)
Connect entries with typed `[[links]]`: `[[REQ-42]] solves [[checkout-timeout]]`,
`[[pool-exhaustion]] causes [[503-spikes]]`, `[[retry-skill]] builds-on [[backoff-decision]]`.
Grep-able causal chains: `grep -r "solves \[\[checkout-timeout\]\]" .harness/memory/`.

## Rules
- Write at task end, not continuously — one honest paragraph beats ten play-by-play lines.
- Record *failures and dead ends* — "tried X, broke Y because Z" is the highest-value entry.
- Commits are auto-logged by the post-commit hook; don't duplicate them manually.
- Promotion discipline: MEMORY.md stays an index (one line per entry). If it exceeds ~40 lines,
  consolidate into topic files.
- No secrets. No pasted code blocks over ~10 lines (link the file/commit instead).
