---
description: Run the loop-engineering workflow for a user goal — grill, deep-dive, refine, story, implement, test, PR, deploy — with human gates at irreversible steps.
argument-hint: <goal statement>
---

# /harness-goal — the loop-engineering workflow

Process the user's goal (`$ARGUMENTS`) through the pipeline below. You are the **supervisor**:
you orchestrate the phase agents, own the artifacts, and stop at the three ⛔ gates until the
human explicitly approves. Never skip, reorder, or merge gates. Every phase output is a file
with status frontmatter — never chat-only.

## 1. Grill the requirement  *(requirement-grill skill)*
Interrogate until falsifiable: outcome, explicit scope exclusions, testable acceptance
criteria (no "fast/better/robust"), the non-functionals this change can violate, failure
behavior, conflicts with prior decisions (wiki-query + org conventions). Batch questions,
stop when testable — over-grilling erodes trust.

## 2. Deep-dive memory
- **Structural**: code-graph MCP — impacted files, callers, blast radius. Check
  `workspace.yaml` provides/consumes if present (contract impact).
- **Domain**: wiki-query over `.harness/memory/wiki/` (related PRDs, decisions, contradictions).
- **Session**: `MEMORY.md` + recent daily logs for prior attempts (`[[...]] causes [[...]]` chains).

## 3. Refined requirement  ⛔ HITL GATE 1
```
bash tools/harness/new-requirement.sh "<one-line goal>"
```
Fill the created `REQ-NNN.md` (grill output + deep-dive impact; status stays `draft`).
**Stop and present it.** Only the user flips status to `approved` — record `approved` verbatim
from their reply; assumptions you made go under "resolved by agent default" so the gate shows
them. `gate-check.sh` blocks push/PR/deploy while nothing is approved.

## 4. Story + test cases  *(story-writer agent)*
Delegate to **story-writer**: Jira story + XRay/Zephyr test cases via Atlassian MCP (tracker =
system of record; local copies in `REQ-NNN/`). Story key + test-case keys land in the REQ
frontmatter. The story ID threads through branch names, commits, and the PR from here on.

## 5. Design + implement  *(architect → implementers, isolated worktrees)*
1. **architect** produces `REQ-NNN/design.md`; resolve its open questions with the user
   before any code.
2. Break the design into tasks; typical order — db first, then backend ∥ frontend in parallel:
   ```
   bash tools/harness/worktree-task.sh create REQ-NNN db-schema
   bash tools/harness/worktree-task.sh create REQ-NNN backend-api
   bash tools/harness/worktree-task.sh create REQ-NNN frontend-ui
   ```
3. Delegate each task to its agent (**db-engineer**, **implementer-backend**,
   **implementer-frontend**) — each works only in its worktree, compose-first, tests included,
   commits tagged with the REQ id.
4. Merge task branches back sequentially into the REQ integration branch; run **unit-tester**
   then **integration-tester** on the merged result. `worktree-task.sh remove` each done task
   (it refuses on uncommitted work — that's deliberate).
5. Automated gate (no human needed): full test suite green, lint clean, org-validate clean,
   and `bash tools/harness/contract-check.sh --` clean — if a provided contract
   changed, list the impacted consumer units in the REQ and create linked consumer tasks
   before proceeding. Red anything → back to the owning agent, not onward.

## 6. E2E tests  *(planner → generator → healer)*
**e2e-planner** turns `test-cases.md` into `e2e-plan.md` → **e2e-generator** writes Playwright
specs against the live app (real selectors via Playwright MCP) → failures classified by
**e2e-healer** (test defects healed; app regressions reported back to step 5, never papered over).

## 7. Pull request  ⛔ HITL GATE 2
Present the evidence table: diff summary, unit/integration/e2e results, org-rule compliance,
anything hand-rolled because no internal component fit. On approval: draft PR via GitHub MCP,
titled with REQ + story key.

## 8. Local verify
Generate/update docker-compose; build and run the whole app locally; smoke-check the REQ's
acceptance criteria end-to-end. Attach results to the PR.

## 9. Cloud deploy  ⛔ HITL GATE 3  *(release-manager agent)*
Approval must be explicit **in this session** — prior approvals don't carry over. Delegate to
**release-manager**: version, release notes from the REQ/story, checklist, deploy via the
profile's provider plugin, watch rollout, documented rollback on failure.

## 10. Close the loop  *(memory-keeper skill)*
Set REQ status `done`. Append the day's entry: what shipped, decisions, dead ends, typed links
(`[[REQ-NNN]] solves [[...]]`). If domain knowledge changed, wiki-ingest the delta. Commits/PRs
were auto-logged by the post-commit hook — don't duplicate them.
