# GitHub Copilot platform notes (verified 2026-07-16)

Sources: [about CLI plugins](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-cli-plugins) ·
[creating plugins](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-creating) ·
[CLI plugin reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference) ·
[marketplaces](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-marketplace) ·
[hooks concepts](https://docs.github.com/en/copilot/concepts/agents/hooks) ·
[hooks reference](https://docs.github.com/en/copilot/reference/hooks-reference) ·
[official marketplace repo](https://github.com/github/copilot-plugins) ·
[enterprise-managed plugins changelog](https://github.blog/changelog/2026-05-06-enterprise-managed-plugins-in-github-copilot-cli-are-now-in-public-preview/)

## Plugins (Copilot CLI)
- `plugin.json` at plugin root, **`name` required** (kebab, ≤64 chars). Optional: `description`
  (≤1024), `version`, `author{name,email?,url?}`, `homepage`, `repository`, `license`,
  `keywords`, `category`, `tags`.
- Component paths: `agents` (default `agents/`, files are **`NAME.agent.md`** — agent ID from
  filename), `skills` (default `skills/`, `skills/<name>/SKILL.md`, deduped by frontmatter
  `name`), `commands` (no default), `hooks` (path or inline), `mcpServers` (path or inline,
  `.mcp.json`), `lspServers`, `extensions` (supports `{paths, exclusive}`).
- Install/manage: `copilot plugin install <spec>` where spec = `plugin@marketplace` |
  `OWNER/REPO` | `OWNER/REPO:PATH` | git URL | local path; `uninstall NAME` (name, not path);
  `update NAME|--all`; `enable|disable NAME`. **Components are cached** — reinstall local
  plugins to pick up changes.
- **Enterprise-managed plugins** (public preview 2026-05): admins distribute plugins
  enterprise-wide, auto-installed; hooks/MCP configs can be "always enabled" for governance.

## Marketplaces
- `marketplace.json` in **`.github/plugin/`** — and **Copilot CLI also reads it from
  `.claude-plugin/`** ← the key interop fact: one marketplace file can serve both ecosystems.
- Schema (compatible with Claude's): required `name`, `owner{name,email?}`, `plugins[]`
  (`name` + `source` required; source = relative path | `{source:"github",repo,path?}` | URL);
  optional `metadata{description,version,pluginRoot}`; entry metadata + per-entry component
  paths + `strict` (default true).
- Two marketplaces pre-registered in every CLI: `github/copilot-plugins` and `awesome-copilot`.
- `copilot plugin marketplace add|list|browse|remove`.

## Custom agents
- Plugin form: `agents/NAME.agent.md`, frontmatter `name`, `description`, `tools` (Copilot tool
  names — Claude tool names do NOT map 1:1; omit and put guidance in body).
- Repo form (coding agent): `.github/agents/NAME.md`; org/enterprise-wide via `.github-private`.
- VS Code has its own agent-plugin support (Ken Muse writeup) — treat as converging, verify.

## Hooks
- Config: `.github/hooks/*.json` (repo), `~/.copilot/hooks/*.json` (personal CLI), or bundled
  in a plugin via the `hooks` manifest field. `{"version":1,"hooks":{"<event>":[{"type":"command",
  "bash":"...","powershell":"...","cwd"?,"env"?,"timeoutSec"?(30)}]}}` — **both `bash` and
  `powershell` variants**; Windows runs powershell.
- Events (8): `sessionStart`, `sessionEnd`, `userPromptSubmitted`, `preToolUse`, `postToolUse`,
  `agentStop`, `subagentStop`, `errorOccurred`. Surfaces: **coding agent + Copilot CLI**
  (NOT documented for VS Code Chat).
- **Semantics vs Claude Code (critical)**:
  | | Claude Code | Copilot |
  |---|---|---|
  | Block a tool call | exit 2 (or JSON permissionDecision) | JSON `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"..."}}` + **exit 0** |
  | exit 2 | blocks (PreToolUse etc.) | does **NOT** block |
  | other non-zero exit | non-blocking error | **fails closed** (denies) on preToolUse |
  | timeout | hook canceled | **fails open** |
  | stdin payload | `tool_name`/`tool_input` (snake_case) | coding agent: snake_case `tool_input`; CLI: camelCase `toolName`/`toolArgs` (**JSON-encoded string** — [copilot-cli#3349](https://github.com/github/copilot-cli/issues/3349)) |
- → never wire Claude-style scripts directly; use `scripts/copilot-hook-adapter.sh`
  (translates exit-2 → deny JSON; normalizes logging hooks to exit 0).
- The shared deny-JSON shape (`hookSpecificOutput.permissionDecision`) works on BOTH platforms —
  a future unification path for gate scripts.

## Instructions & MCP
- Coding agent reads `AGENTS.md` (root + nested), `.github/copilot-instructions.md`,
  `.github/instructions/**.instructions.md`, **and `CLAUDE.md`/`GEMINI.md` directly**.
- Prompt files: `.github/prompts/*.prompt.md` (VS Code Copilot Chat).
- MCP: VS Code `.vscode/mcp.json`; plugins bundle `.mcp.json`; enterprise can force-enable.

## Verification items — resolutions (2026-07-16, user-verified + re-checked)

1. **Plugin-bundled hooks.json paths — RESOLVED (user-verified)**: file references inside a
   plugin's `hooks.json` resolve **relative to the plugin root**, not the session cwd.
   → se-harness-copilot now bundles its hooks (`./scripts/...` paths); repo-level
   `.github/hooks/` remains supported for non-plugin installs and enterprise governance.
2. **`commands` component semantics — user-reported**: command paths are directories containing
   `SKILL.md` files registered into the CLI skill registry and invoked as `copilot <name> <args>`
   (i.e., commands are skill-shaped, not flat .md like Claude commands). → the build now emits
   each harness command **as a skill directory too** (`skills/<name>/SKILL.md`), which is valid
   under both interpretations; flat `commands/*.md` copies retained for reference.
3. **preToolUse payload — CONFLICTING SOURCES, keep the capture step.** A user-obtained schema
   reports camelCase fields (`event`, `toolName`, `toolArgs` as an *array*, `toolInput` string,
   plus `toolOutput`/`toolExitCode` — odd for a *pre* event) and "$toolInput" interpolation.
   The official [hooks reference](https://docs.github.com/en/copilot/reference/hooks-reference)
   states: coding agent = snake_case `tool_input`; CLI = camelCase `toolArgs` as a
   **JSON-encoded string** ([copilot-cli#3349](https://github.com/github/copilot-cli/issues/3349)).
   These disagree on toolArgs' type and the extra fields. Our scripts' substring greps
   (`"command"`, file paths) tolerate all reported shapes, but **run the §4.7 payload capture
   on your surface before trusting the gate** — this row stays open until captured live.
4. **VS Code Copilot hooks & plugins — RESOLVED (re-verified against
   [VS Code docs](https://code.visualstudio.com/docs/copilot/customization/hooks))**: VS Code
   supports 8 events with **Claude Code's conventions** — PascalCase names (`SessionStart`,
   `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `PreCompact`, `SubagentStart/Stop`, `Stop`),
   stdin JSON with `hook_event_name`/`cwd`/`session_id`, and **exit 2 = blocking error** (unlike
   CLI/coding agent!). Config read from `.github/hooks/*.json`, **`.claude/settings.json` /
   `.claude/settings.local.json`**, `~/.copilot/hooks`, `~/.claude/settings.json`, agent
   frontmatter `hooks:`, and plugin `hooks.json` / `hooks/hooks.json`. JSON output honored
   (`continue`, `permissionDecision`). Customization precedence: Policy → User → Project → Plugins.

**Practical consequence**: the blocking mechanism that works on EVERY surface (Claude Code,
Copilot CLI, coding agent, VS Code) is the **deny-JSON** —
`{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny",...}}` + exit 0 —
which is exactly what `copilot-hook-adapter.sh` emits. Exit-2 blocking works on Claude Code and
VS Code but NOT on Copilot CLI/coding agent. The hook-semantics fragmentation is per-surface,
not per-vendor.
