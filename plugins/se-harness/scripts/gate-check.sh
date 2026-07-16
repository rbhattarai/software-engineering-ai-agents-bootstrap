#!/usr/bin/env bash
# gate-check.sh — PreToolUse hook on Bash (v0).
# HITL gate enforcement (A5 #5): blocks irreversible actions (PR creation, push, deploy)
# while no approved requirement exists in .harness/requirements/.
# Reads the hook JSON on stdin; v0 parses with grep (no jq dependency).
# Exit 2 = block with message to Claude; exit 0 = allow.

set -u
INPUT=$(cat)

# Only inspect Bash tool calls whose command looks irreversible.
# Escaped-quote-aware: extract the full command value first (quoted args inside the command
# must not truncate the match), then test it.
CMD=$(printf '%s' "$INPUT" \
  | grep -oE '"command"[[:space:]]*:[[:space:]]*"(\\.|[^"\\])*"' | head -1 \
  | sed -E 's/^"command"[[:space:]]*:[[:space:]]*"//; s/"$//; s/\\"/"/g; s/\\\\/\\/g')
printf '%s' "$CMD" | grep -qE '(gh pr create|git push|docker push|terraform apply|vercel deploy|aws .* deploy|gcloud .* deploy|az .* (deploy|up))' || exit 0

# No harness in this repo → not our business.
[ -d ".harness/requirements" ] || exit 0

if grep -lq "^status: *approved" .harness/requirements/REQ-*.md 2>/dev/null; then
  exit 0
fi

echo "BLOCKED by se-harness gate: no requirement in .harness/requirements/ has status: approved." >&2
echo "Present the refined requirement to the user and get explicit approval (HITL gate) first." >&2
exit 2
