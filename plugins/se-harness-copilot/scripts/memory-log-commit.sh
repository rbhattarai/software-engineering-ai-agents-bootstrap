#!/usr/bin/env bash
# memory-log-commit.sh — PostToolUse hook on Bash (v0).
# Deterministic tier-2 memory maintenance: appends git commits and PR creations to today's
# daily log automatically, so the session record accrues without LLM effort (A4 Phase 4).
# Always exits 0 — logging must never block work.

set -u
MEM=".harness/memory"
[ -d "$MEM" ] || exit 0

INPUT=$(cat)
# Escaped-quote-aware extraction: match the full JSON string value, then unescape.
CMD=$(printf '%s' "$INPUT" \
  | grep -oE '"command"[[:space:]]*:[[:space:]]*"(\\.|[^"\\])*"' | head -1 \
  | sed -E 's/^"command"[[:space:]]*:[[:space:]]*"//; s/"$//; s/\\"/"/g; s/\\\\/\\/g')
[ -n "$CMD" ] || exit 0

ENTRY=""
case "$CMD" in
  *"git commit"*)
    # Best-effort message extraction; fall back to the plain fact of a commit.
    MSG=$(printf '%s' "$CMD" | sed -n "s/.*-m *[\"']\([^\"']*\)[\"'].*/\1/p" | head -1)
    ENTRY="committed: ${MSG:-git commit}"
    ;;
  *"gh pr create"*)
    ENTRY="opened PR (gh pr create)"
    ;;
  *"git merge"*)
    ENTRY="merged: ${CMD#*git merge }"
    ;;
  *) exit 0 ;;
esac

mkdir -p "$MEM/daily"
DAY="$MEM/daily/$(date +%Y-%m-%d).md"
[ -f "$DAY" ] || printf '# %s\n\n' "$(date +%Y-%m-%d)" > "$DAY"
BRANCH=$(git branch --show-current 2>/dev/null || echo "")
printf -- '- %s %s%s\n' "$(date +%H:%M)" "$ENTRY" "${BRANCH:+ (branch: $BRANCH)}" >> "$DAY"
exit 0
