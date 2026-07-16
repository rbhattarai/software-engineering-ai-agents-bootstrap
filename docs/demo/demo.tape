# vhs tape for the README demo GIF — see docs/demo/README.md
# Run from a demo project directory that has the se-harness plugin installed:
#   vhs /path/to/se-harness/docs/demo/demo.tape
# Interactive agent output varies per run — tune the Sleep durations to your machine.

Output docs/assets/demo.gif

Set FontSize 18
Set Width 1400
Set Height 800
Set Theme "Catppuccin Mocha"
Set TypingSpeed 40ms

# Scene 1 — init: scan + confirm
Type "claude"
Enter
Sleep 4s
Type "/harness-init"
Enter
Sleep 25s          # scan runs, stack-detection confirmation appears
Type "y"
Enter
Sleep 10s

# Scene 2 — the generated artifacts
Ctrl+C
Sleep 1s
Type "ls .harness/ && head -20 AGENTS.md"
Enter
Sleep 4s

# Scene 3 — goal loop hits the gate
Type "claude"
Enter
Sleep 4s
Type '/harness-goal "Add CSV export to the reports page"'
Enter
Sleep 30s          # grill + REQ-001.md written; gate blocks until approved

Sleep 3s
