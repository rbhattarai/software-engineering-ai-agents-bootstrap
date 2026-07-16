#!/usr/bin/env bash
# inject-context.sh — UserPromptSubmit hook (v0).
# Assembles the budgeted memory hot set (see skills/context-injector/SKILL.md) and prints it
# to stdout; Claude Code appends stdout of UserPromptSubmit hooks as context.
# Caps are in bytes (approximation of chars). Silent no-op when .harness/ is absent.

set -u
MEM=".harness/memory"
[ -d "$MEM" ] || exit 0

TODAY=$(date +%Y-%m-%d)
YESTERDAY=$(date -d "yesterday" +%Y-%m-%d 2>/dev/null || date -v-1d +%Y-%m-%d 2>/dev/null || echo "")

emit_capped() { # emit_capped <label> <file> <cap_bytes> [tail]
  local label="$1" file="$2" cap="$3" mode="${4:-head}"
  [ -s "$file" ] || return 0
  echo "--- $label ---"
  if [ "$mode" = "tail" ]; then
    tail -c "$cap" "$file"
  else
    head -c "$cap" "$file"
  fi
  echo ""
}

echo "<harness-memory-context>"

# P1: scratchpad (2K)
emit_capped "scratchpad (open items)" "$MEM/SCRATCHPAD.md" 2048

# P2: active requirement (2K) — first non-done requirement, newest first
if [ -d ".harness/requirements" ]; then
  for f in $(ls -t .harness/requirements/REQ-*.md 2>/dev/null); do
    if ! grep -q "^status: *done" "$f" 2>/dev/null; then
      emit_capped "active requirement ($f)" "$f" 2048
      break
    fi
  done
fi

# P3: today's daily log tail (3K)
emit_capped "today ($TODAY)" "$MEM/daily/$TODAY.md" 3072 tail

# P4: long-term memory index (4K)
emit_capped "MEMORY.md" "$MEM/MEMORY.md" 4096

# P5: yesterday's daily log tail (3K)
[ -n "$YESTERDAY" ] && emit_capped "yesterday ($YESTERDAY)" "$MEM/daily/$YESTERDAY.md" 3072 tail

echo "</harness-memory-context>"
exit 0
