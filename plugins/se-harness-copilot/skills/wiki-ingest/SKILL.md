---
name: wiki-ingest
description: Ingest an external source (Confluence page, Jira epic, URL, document) into the project's domain wiki — synthesize into pages, update the index, log the operation. Use when the user shares a source, when org conventions_url is set, or when /harness-goal finds an unread PRD.
---

# Wiki Ingest (Karpathy pattern, B7)

You maintain `.harness/memory/wiki/` — synthesized domain knowledge. **Raw sources are
immutable; you never store copies of them — only synthesis.** Retrieval stays live via MCP
(Atlassian for Jira/Confluence, SharePoint MCP); what persists is your distillation.

## Procedure
1. **Read the source** via the right MCP/tool (Confluence page, Jira epic tree, fetched URL,
   local document). Video/NAS sources are v2 — politely decline and note them in the log.
2. **Extract**: entities (services, domain objects, flows), decisions (+rationale), constraints,
   contradictions with existing wiki content.
3. **Synthesize into pages** (`wiki/<topic>.md`) — update existing pages rather than creating
   near-duplicates; one concept per page; rewrite freely (this tier is *revised*, not
   append-only). A single source legitimately touches many pages.
4. Each page carries a `sources:` footer line per contributing source
   (`Confluence ACME/PRD-payments, ingested 2026-07-15`) — provenance without copying content.
5. **Contradictions**: never silently overwrite. Add a `⚠ CONTRADICTION` block quoting both
   claims + sources, and surface it to the user (or leave it for wiki-lint if mid-task).
6. **Refresh `wiki/index.md`** — one line per page. **Append to `wiki/log.md`**:
   `date | ingest | source | pages touched`.

## Rules
- No secrets, credentials, or personal data into pages — ever, even if the source has them.
- Keep pages skimmable (< ~150 lines); split when they outgrow that.
- Cross-link related pages with `[[wiki-links]]` — links compound value.
