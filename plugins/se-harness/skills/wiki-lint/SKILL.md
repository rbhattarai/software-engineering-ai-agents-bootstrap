---
name: wiki-lint
description: Health-check the domain wiki — contradictions, stale claims, orphan pages, index drift, missing links. Use periodically, after large ingests, or when the user asks whether the wiki is trustworthy.
---

# Wiki Lint

Audit `.harness/memory/wiki/` and produce a findings report; fix mechanical issues, ask before
substantive ones.

## Checks
1. **Index drift** — pages missing from `index.md`; index lines pointing at deleted pages.
   *Fix mechanically.*
2. **Orphans** — pages nothing links to. Propose links or merging.
3. **Contradictions** — unresolved `⚠ CONTRADICTION` blocks, plus new ones you spot between
   pages. List each with both sources; resolution decisions belong to the user.
4. **Staleness** — pages whose `sources:` are older than significant related changes (compare
   against recent daily-log entries and REQ activity). Flag for re-ingest; don't guess updates.
5. **Secrets sweep** — anything credential-shaped that slipped in. Redact immediately and
   report (this fix never waits for permission).
6. **Size** — pages over ~150 lines → propose splits.

## Output
Findings table (check | page | detail | action taken/proposed), then apply the mechanical
fixes, then append `date | lint | <n> findings | pages touched` to `wiki/log.md`.
