#!/usr/bin/env bash
# worktree-task.sh — isolated worktree per implementation task (B1 principle 6).
# Deterministic mechanics for /harness-goal step 5 fan-out.
#
# usage:
#   worktree-task.sh create <REQ-ID> <task-slug> [base-branch]   # e.g. create REQ-007 backend-api
#   worktree-task.sh remove <REQ-ID> <task-slug>                 # after merge; branch is kept
#   worktree-task.sh list

set -eu
CMD="${1:?usage: worktree-task.sh create|remove|list ...}"
WT_ROOT=".worktrees"

ensure_ignored() {
  grep -qxF "$WT_ROOT/" .gitignore 2>/dev/null || echo "$WT_ROOT/" >> .gitignore
}

case "$CMD" in
  create)
    REQ="${2:?REQ-ID required}"; SLUG="${3:?task-slug required}"; BASE="${4:-HEAD}"
    git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "not a git repo" >&2; exit 1; }
    ensure_ignored
    DIR="$WT_ROOT/$REQ-$SLUG"; BRANCH="$REQ/$SLUG"
    [ ! -e "$DIR" ] || { echo "worktree already exists: $DIR" >&2; exit 1; }
    mkdir -p "$WT_ROOT"
    git worktree add "$DIR" -b "$BRANCH" "$BASE" >/dev/null
    echo "$DIR"           # agents cd here; commits carry the REQ id via the branch name
    ;;
  remove)
    REQ="${2:?REQ-ID required}"; SLUG="${3:?task-slug required}"
    DIR="$WT_ROOT/$REQ-$SLUG"
    [ -d "$DIR" ] || { echo "no such worktree: $DIR" >&2; exit 1; }
    # Refuses when the worktree is dirty — uncommitted agent work must be committed or
    # explicitly discarded by a human, never silently dropped.
    git worktree remove "$DIR"
    echo "removed $DIR (branch $REQ/$SLUG kept for merge/inspection)"
    ;;
  list)
    git worktree list
    ;;
  *)
    echo "unknown subcommand: $CMD (create|remove|list)" >&2; exit 1
    ;;
esac
