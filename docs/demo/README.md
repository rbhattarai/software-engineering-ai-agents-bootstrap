# Recording the README demo GIF

Target: **`docs/assets/demo.gif`** — 45–60 seconds, ≤ 10 MB, terminal only.
Once it exists, uncomment the image block near the top of the root `README.md`.

## Storyboard (what to show, in order)

Rehearse once first. Record in a real project that has the plugin installed (a small demo
app works best — the loan-app example from the setup guides is ideal).

1. **Init (~15s):** run `/harness-init` in an existing repo. Let the scan-confirmation
   moment be visible — the harness *detecting* the stack and asking you to confirm is the
   differentiator. Cut the rest of the interview.
2. **The generated artifacts (~5s):** `ls .harness/` and the top of `AGENTS.md` showing
   the `SEAA:GENERATED` markers.
3. **Goal (~20s):** `/harness-goal "Add CSV export to the reports page"` — show the grill
   question(s) and the written `.harness/requirements/REQ-001.md`.
4. **The money shot (~10s):** the gate hook **blocking** the PR/push with its message,
   then flipping `status: approved` in the REQ file, then the action going through.
   This is the frame people share — don't cut it short.

## Recording tips

- Terminal ~100×30, font 16–18 pt, a dark theme with good contrast (the GIF is shown
  small in the README — text must be readable at half size).
- Clean prompt (no long paths), `clear` between scenes.
- Trim dead time: long agent thinking pauses should be cut or sped up in the editor.

## Option A — ScreenToGif (easiest on Windows)

1. Install: `winget install NickeManarin.ScreenToGif`
2. Open ScreenToGif → **Recorder**, frame it around your Windows Terminal window.
3. Record the storyboard, then in the editor: delete dead frames, add 2× speed to slow
   sections, **Save as → GIF** (encoder: FFmpeg if offered; ~15 fps is plenty).
4. Save to `docs/assets/demo.gif`.

## Option B — vhs (scripted, reproducible)

[vhs](https://github.com/charmbracelet/vhs) replays a `.tape` script and renders a GIF —
same output every time, easy to re-record after UI changes.

```powershell
winget install charmbracelet.vhs   # or: scoop install vhs (installs ttyd + ffmpeg deps)
vhs docs/demo/demo.tape
```

`docs/demo/demo.tape` in this folder types the storyboard commands into a live Claude Code
session. Interactive agent output varies run to run, so adjust the `Sleep` durations to
your machine's pacing, or use vhs only for scenes 1–2 and ScreenToGif for the gate scene.

## Option C — asciinema (WSL) + agg

```bash
# inside WSL
sudo apt install asciinema && cargo install --git https://github.com/asciinema/agg
asciinema rec demo.cast          # record, Ctrl-D to stop
agg --font-size 18 demo.cast demo.gif
```

Bonus: also upload the `.cast` to asciinema.org — embeddable in blog posts and crisp at
any size.

## Size check before committing

```powershell
Get-Item docs/assets/demo.gif | Select-Object Length   # aim for < 10 MB
```

If it's too big: fewer fps (10–12), smaller terminal, shorter scenes — in that order.
