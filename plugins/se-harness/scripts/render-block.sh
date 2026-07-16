#!/usr/bin/env bash
# render-block.sh — idempotent SEAA:GENERATED block splice (A5/§2 merge mechanism).
#
# usage: render-block.sh <target-file> <content-file>
#   <content-file> holds the INNER block content only (no markers — this script owns the markers).
#
# Behavior:
#   target missing            → create it: markers wrapping content + editable-area hint
#   target has markers        → replace ONLY the content between markers; everything else untouched
#   target exists, no markers → prepend the marked block above existing content (never modifies it)

set -eu
TARGET="${1:?usage: render-block.sh <target-file> <content-file>}"
CONTENT="${2:?usage: render-block.sh <target-file> <content-file>}"
[ -f "$CONTENT" ] || { echo "content file not found: $CONTENT" >&2; exit 1; }

START_LINE='<!-- SEAA:GENERATED:START — managed by se-harness; sync rewrites ONLY this block. -->'
END_LINE='<!-- SEAA:GENERATED:END -->'

if [ ! -f "$TARGET" ]; then
  {
    echo "$START_LINE"
    cat "$CONTENT"
    echo "$END_LINE"
    echo ""
    echo "<!-- Hand-written notes below this line survive every sync. -->"
  } > "$TARGET"
  echo "created: $TARGET"
elif grep -q 'SEAA:GENERATED:START' "$TARGET"; then
  awk -v cf="$CONTENT" '
    /SEAA:GENERATED:START/ { print; while ((getline line < cf) > 0) print line; close(cf); inblock=1; next }
    /SEAA:GENERATED:END/   { print; inblock=0; next }
    !inblock               { print }
  ' "$TARGET" > "$TARGET.seaa.tmp" && mv "$TARGET.seaa.tmp" "$TARGET"
  echo "updated block: $TARGET"
else
  {
    echo "$START_LINE"
    cat "$CONTENT"
    echo "$END_LINE"
    echo ""
    cat "$TARGET"
  } > "$TARGET.seaa.tmp" && mv "$TARGET.seaa.tmp" "$TARGET"
  echo "prepended block: $TARGET (existing content preserved below)"
fi
