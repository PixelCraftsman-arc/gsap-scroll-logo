# Hero → logo scroll transition

Hand-tuned GSAP / ScrollTrigger prototype. Scroll-scrubbed, fully reversible.

## Run

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Motion notes

- Typography dissolves with blur and uneven stagger — not cardinal fly-offs
- Figures anticipate, then drift and fade (no clip-path walk cycles)
- Each bar has its own anticipation, flight arc, mid-air rotation, and soft land
- Missing strokes settle in from nearby landed pieces (opacity + offset), not edge-wipe “grows”
- Soft scrub (`0.85`) so the hand on the wheel feels continuous

## Files

- `index.html` / `style.css` — layout
- `main.js` — geometry + timeline
- `img/` — figure cut-outs
- `INTEGRATION.md` — Webflow handoff

Tune from the console with `window.__tl.progress(0.4)`.
