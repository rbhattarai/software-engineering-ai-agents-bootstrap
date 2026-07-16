---
name: stack-detector
description: Evidence-based detection of a brownfield repo's stack, devops, cloud, and organization conventions. Use during /harness-scan — reason over collected evidence, never guess from a single package name, and always attach evidence + confidence to every claim.
---

# Stack Detector

You are detecting what a codebase *actually uses*, not what its files superficially mention.
Input: the sectioned report from `scripts/scan-evidence.sh` plus targeted follow-up reads.
Output: a **proposal table** — every claim carries evidence and confidence.

## Reasoning rules
1. **Usage beats listing.** A dependency in a manifest is weak evidence; imports/config/code
   that exercise it are strong. (`kafkajs` in package.json = "maybe"; a `Kafka(` client
   constructed in `src/` = "yes".) When a manifest hit matters, grep for real usage before
   claiming it.
2. **Version-aware.** Note major versions where visible (React 18 vs 19, Spring Boot 2 vs 3,
   .NET 6 vs 8) — they change which rules/plugins the recommender should pick.
3. **Distinguish app vs tooling.** `webpack` is tooling, not "the stack". Report languages/
   frameworks/data/messaging as the app's stack; CI/containers/IaC under devops.
4. **Cloud from artifacts, not vibes.** Terraform providers, `vercel.json`, `azure-pipelines`,
   SDK deps with actual usage. If multiple clouds appear, report all with evidence — don't pick.
5. **Monorepo awareness.** If topology markers exist, detect per-unit stacks (each package/
   module gets its own row), not one blended stack.

## Organization-context detection (the org: section)
- **Internal libraries**: private registry configs (`.npmrc` scopes → registry URLs,
  `NuGet.config` internal feeds, pip `extra-index-url`, Maven internal mirrors) + the top
  recurring scoped imports (`@acme/*`, `com.acme.*`). An internal scope that appears in both
  registry config AND imports is high confidence.
- **Preferred libraries**: consistent exclusive choices across the codebase (only `dayjs`
  everywhere → preferred; both `dayjs` and `moment` → flag the inconsistency, ask which is
  the standard rather than inventing a rule).
- **Conventions**: lint/format configs are explicit conventions (report the enforced rules that
  matter to agents: naming, import order, strictness). Beyond configs, infer *implicit*
  conventions from the code itself — error-handling shape, layering (controller/service/repo?),
  test file placement, naming patterns. This is the ECC `inherit-legacy-style` job: propose each
  inferred convention separately so the user can accept/reject one at a time.

## Output format (the proposal)
| field | proposed value | evidence | confidence |
|---|---|---|---|
| stack.languages | typescript, sql | 312 .ts files; migrations/ | high |
| stack.messaging | kafka | kafkajs@2 + `new Kafka(` in src/events/ | high |
| org.internal_libraries | @acme/ui | .npmrc scope → npm.acme.io; 41 imports | high |
| org.preferred_libraries | use dayjs never moment | dayjs only, 0 moment imports | medium |

Rules with `low` confidence or detected inconsistencies MUST go to the user as questions,
never silently into the profile.
