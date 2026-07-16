#!/usr/bin/env bash
# copilot-hook-adapter.sh — run a Claude-style se-harness hook script under GitHub Copilot
# hooks (.github/hooks/*.json), translating the semantics that differ:
#
#   Claude Code:   exit 2 = block (PreToolUse) / surface feedback (PostToolUse), stderr → agent
#   Copilot:       preToolUse deny = JSON {"hookSpecificOutput":{"permissionDecision":"deny",...}}
#                  + exit 0;  exit 2 does NOT block;  other non-zero exits fail-closed (deny);
#                  timeouts fail-open.   (docs.github.com/en/copilot/reference/hooks-reference)
#
# usage: copilot-hook-adapter.sh <pre|post> <script> [script-args...]
#   pre  → script exit 2 becomes an explicit deny JSON with the script's stderr as the reason
#   post → script output passes through as feedback; never blocks
#
# NOTE: payload field names differ per surface (coding agent: snake_case tool_input;
# CLI: camelCase toolArgs as a JSON-encoded string). The se-harness scripts grep for
# '"command"' / '"file_path"' substrings, which appear in both encodings — but verify against
# your surface's actual payload before trusting a gate with real enforcement.

set -u
MODE="${1:?usage: copilot-hook-adapter.sh <pre|post> <script> [args...]}"; shift
SCRIPT="${1:?script path required}"; shift || true

INPUT=$(cat 2>/dev/null || true)
OUT=$(printf '%s' "$INPUT" | bash "$SCRIPT" "$@" 2>&1)
CODE=$?

if [ "$MODE" = "pre" ] && [ "$CODE" -eq 2 ]; then
  # Claude-style block → Copilot explicit deny (JSON on stdout, exit 0).
  REASON=$(printf '%s' "$OUT" | tr '\n' ' ' | sed 's/\\/\\\\/g; s/"/\\"/g' | cut -c1-500)
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}\n' "$REASON"
  exit 0
fi

# Everything else: pass feedback through, never fail-closed by accident (a crashed logging
# hook must not deny the agent's tool call).
[ -n "$OUT" ] && printf '%s\n' "$OUT" >&2
exit 0
