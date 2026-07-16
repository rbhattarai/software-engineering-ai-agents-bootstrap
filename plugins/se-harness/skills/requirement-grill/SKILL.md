---
name: requirement-grill
description: Interrogate a goal until it is an unambiguous, testable requirement — scope, acceptance criteria, non-functionals, out-of-scope. Use at /harness-goal step 1 and whenever a request is vague enough that two reasonable engineers would build different things.
---

# Requirement Grill

Your job is to make the requirement **falsifiable** before anyone designs or codes. Two
reasonable engineers reading it must build the same thing.

## What to interrogate (in order, skip what the goal already answers)
1. **Outcome** — what changes for which user/system when this ships? ("done means…")
2. **Scope boundary** — the nearest things this does NOT include. Get at least one explicit
   exclusion; vague goals hide scope in the boundary.
3. **Acceptance criteria** — concrete, testable, one behavior each. Rewrite any criterion
   containing "fast", "better", "robust", "user-friendly" into a measurable statement
   (number, threshold, observable behavior) or move it to open questions.
4. **Non-functionals that bite** — only the ones this change can actually violate: data
   volume, latency budget, authz, compliance, backward compatibility, migration window.
5. **Failure behavior** — what should happen when the happy path doesn't (timeouts, partial
   writes, invalid input)? Most reworks hide here.
6. **Constraints from memory** — check the wiki (wiki-query) and org conventions for prior
   decisions this goal touches; surface conflicts NOW, not at implementation.

## How to ask
- Use AskUserQuestion; batch related questions (≤4 per call); offer concrete options with
  a recommended default rather than open-ended prompts where possible.
- Stop when: every acceptance criterion is testable, at least one exclusion is recorded, and
  failure behavior is stated. Do not keep grilling past that — over-grilling erodes trust.
- If the user says "just decide": decide, but record each decision under "Open questions →
  resolved by agent default" in the REQ so the approval gate shows exactly what was assumed.

## Output
Fill the REQ file (created by `scripts/new-requirement.sh`) — refined requirement, acceptance
criteria checklist, out-of-scope list, impact notes, open questions. Status stays `draft`;
only the human flips it to `approved`.
