# Claude Code platform notes (verified 2026-07-16)

Sources: [plugins-reference](https://code.claude.com/docs/en/plugins-reference) ·
[hooks](https://code.claude.com/docs/en/hooks) ·
[plugin-marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) ·
docs index: https://code.claude.com/docs/llms.txt

## Plugin manifest (`.claude-plugin/plugin.json`)
- Only `name` is **required** (kebab-case). Manifest itself is optional (components auto-discovered).
- Metadata: `displayName`, `version` (semver — pins updates; omitted = git SHA per commit),
  `description`, `author{name,email,url}`, `homepage`, `repository`, `license`, `keywords`,
  `defaultEnabled` (v2.1.154+), `$schema` → `https://json.schemastore.org/claude-code-plugin-manifest.json`.
- Component paths: `skills` (ADDS to default `skills/`), `commands`/`agents`/`outputStyles`
  (REPLACE defaults), `hooks`/`mcpServers`/`lspServers` (own merge rules),
  `experimental.{themes,monitors}`, `userConfig`, `channels`, `dependencies` (with semver constraints).
- **Unrecognized top-level fields are ignored** (warnings in `claude plugin validate`) — one
  manifest can double for another ecosystem. Wrong *types* on known fields still fail.
- Validate in CI: `claude plugin validate ./plugin --strict`.

## Components
- **Commands**: flat `.md` files in `commands/` → `/name` shortcuts. **Skills**: `skills/<name>/SKILL.md`
  (+ supporting files). Root `SKILL.md` = single-skill plugin (name from frontmatter).
- **Agents**: `agents/*.md`; frontmatter: `name`, `description`, `model`, `effort`, `maxTurns`,
  `tools`, `disallowedTools`, `skills`, `memory`, `background`, `isolation` (`"worktree"` only).
  Plugin agents may NOT set `hooks`, `mcpServers`, `permissionMode`. Namespaced `plugin:agent`.
- **Hooks**: `hooks/hooks.json` (optional top-level `description`). Also skill/agent frontmatter `hooks:`.
- **MCP**: `.mcp.json`; bundled-server scoped names: matchers `mcp__plugin_<plugin>_<server>__<tool>`,
  `mcp_tool` hooks `plugin:<plugin>:<server>`.
- **LSP** `.lsp.json`; **monitors** (experimental, interactive CLI only); **themes** (experimental).

## Hooks essentials for this framework
- Events used here: `UserPromptSubmit` (exit 0 stdout → added as context ✓ inject-context),
  `PreToolUse` (exit 2 blocks ✓ gate-check/contract-check; ALSO supports JSON
  `hookSpecificOutput.permissionDecision: allow|deny|ask|defer` + `updatedInput`),
  `PostToolUse` (exit 2 = stderr shown to Claude, cannot block ✓ org-validate/memory-log).
- Handler types: `command` | `http` | `mcp_tool` | `prompt` | `agent`. Command fields:
  `command`, `args` (**exec form** — preferred for `${CLAUDE_PLUGIN_ROOT}` paths, no quoting),
  `async`, `asyncRewake`, `shell`, `timeout` (default 600s), `if` (permission-rule filter), `once`.
- **Shell-form commands must quote the placeholder**: `"\"${CLAUDE_PLUGIN_ROOT}\"/scripts/x.sh"`
  (paths can contain spaces — Windows). ← applied to our hooks.json 2026-07-16.
- Exit codes: 0 = success (JSON stdout parsed); 2 = block (event-dependent); other = non-blocking error.
- stdin JSON: `session_id`, `cwd`, `hook_event_name`, `permission_mode`, `tool_name`,
  `tool_input`, `agent_type` (plugin agents: `plugin-name:agent-name`)...
- Placeholders: `${CLAUDE_PLUGIN_ROOT}` (changes on update), `${CLAUDE_PLUGIN_DATA}`
  (persists across updates — use for caches), `${CLAUDE_PROJECT_DIR}`.
- Rich event surface beyond our use: `WorktreeCreate/Remove`, `SubagentStart/Stop`,
  `TaskCreated/Completed`, `FileChanged`, `PreCompact`, `Setup` (CI `--init-only`), etc. —
  candidates for future hardening (e.g. `WorktreeCreate` could replace worktree-task.sh someday).

## Marketplace (`.claude-plugin/marketplace.json`)
- Required: `name` (kebab), `owner{name}`; `plugins[]` entries: required `name` + `source`.
- Sources: relative path `"./plugins/x"` (resolves against marketplace ROOT, not the
  .claude-plugin dir; breaks for URL-only distribution), `{source:"github",repo}` (+`ref`/`sha`
  on plugin sources), git URL, git subdir `{url,path}`, npm `{package}`.
- Entry options: `description`, `version`, `author`, `category`, `tags`, `strict`,
  `defaultEnabled` (overrides plugin.json).
- Install scopes: `user` (default) / `project` (`.claude/settings.json`) / `local` / `managed`.
- Skills-directory plugins: `<skills-dir>/foo/.claude-plugin/plugin.json` loads in place as
  `foo@skills-dir` (no install); project scope gated by workspace trust.

## Framework compliance status
- plugin.json / marketplace.json / hooks.json / agents / commands / skills: **schema-valid**
  against this reference. Fix applied: quoted `${CLAUDE_PLUGIN_ROOT}` in shell-form hook commands.
- Worth adopting later: `$schema` + `claude plugin validate --strict` in CI; `keywords`;
  `${CLAUDE_PLUGIN_DATA}` if hooks ever cache state; `Setup` hook for one-time init.
