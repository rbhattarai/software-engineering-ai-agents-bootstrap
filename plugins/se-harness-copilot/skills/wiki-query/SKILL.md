---
name: wiki-query
description: Answer domain questions from the project wiki with citations — and file useful new syntheses back into it. Use during /harness-goal deep-dive (step 2) and whenever a question concerns domain knowledge rather than code.
---

# Wiki Query

1. **Index first**: read `wiki/index.md`; open only the pages it points to for this question.
   Never bulk-read the wiki (context-injector doctrine).
2. **Answer with citations**: every claim names its page (`per [[payments]]`). If pages carry
   a `⚠ CONTRADICTION` block relevant to the answer, present both sides — don't pick silently.
3. **Gaps are answers too**: if the wiki doesn't cover it, say so and name the likely source to
   ingest (Confluence space, Jira epic) rather than guessing from general knowledge.
4. **Compound**: if answering required synthesis across ≥2 pages and the result is durable,
   file it back as a new/updated page + index line (explorations compound — Karpathy).
5. **Log** non-trivial queries: `date | query | question | pages read` in `wiki/log.md`.
