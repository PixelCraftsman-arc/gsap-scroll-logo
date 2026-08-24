# Webflow integration

Notes for the developer building the site. The animation is a paste-in —
you do not need to read the timeline to install it.

Send back the staging URL (`your-site.webflow.io`) so the motion can be
tested at real breakpoints on the real build.

---

## GSAP licensing

None to buy. GSAP (including ScrollTrigger) is free. Load it from the
CDN, or use Webflow’s built-in GSAP if the project already does.
**Do not ship two copies of GSAP.**

---

## Option A — native build (recommended)

The headline stays real text, editable in the Designer. You build the
two sections normally and put the contract names below on the relevant
elements. The script finds them by name, measures where they are, and
animates from there — so Designer nudges don’t break the motion.

### Structure

```
section          .hero-pin           ← pinned section
  div            .hero-stage         ← position: relative, full viewport
    heading      .hero-line          ← one per headline line
    image        .hero-fig     + id  ← one per illustration
    div          .hero-piece   + id  ← one per black rectangle in the hero
section          .logo-screen        ← second screen
  div            .logo-mark          ← position: relative, holds the mark
    div          .logo-piece   + id  ← one per rectangle of the logo
```

`.hero-piece` and `.logo-piece` are plain black divs — no images.
Give each an ID from the table below.

### IDs — travellers (hero ↔ logo share the suffix)

| Hero element | Logo element | What it is |
|---|---|---|
| `hero-bar2` | `logo-bar2` | Tilted bar the two figures carry |
| `hero-bar4` | `logo-bar4` | Long bar she sits on |
| `hero-v1`   | `logo-v1`   | Tall bar being pushed, bottom left |
| `hero-v4`   | `logo-v4`   | Tall bar by the tape measure |

### IDs — grow-in pieces (logo screen only)

`logo-bar1` `logo-bar3` `logo-con1` `logo-con2` `logo-con3`
`logo-c1` `logo-c2` `logo-c3` `logo-v2` `logo-v3`

### IDs — illustrations

`fig-push-bar` `fig-measure` `fig-push-left` `fig-sit` `fig-carry-right`

### Where the code goes

**Page Settings → Custom Code → Before `</body>`:**

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="…/scroll-logo.js"></script>
```

Put the small supporting CSS into **Page Settings → Inside `<head>`**.

`scroll-logo.js` can live on a CDN, in Webflow Assets, or inline.
For the self-contained demo, `main.js` + `rig.js` are the starting point;
a measure-from-layout Webflow build wires the same timeline to live DOM
positions instead of the fixed design-frame tables.

### Two things to watch

1. **Do not set `overflow: hidden` on the pinned section.** ScrollTrigger
   inserts a pin-spacer; a clipped fixed-height wrapper cannot grow
   around it. Clip the inner stage instead.
2. **Pieces must be positioned, not in document flow.** Absolute inside
   the stage is fine; flex/grid children get re-laid-out mid-animation.

---

## Option B — self-contained embed

Ship the whole composition as one Embed. Fastest to install, hardest to
break — but the headline is then locked in code rather than editable in
the Designer. Use this only if these two screens are a fixed graphic
block. The current demo is built this way.

---

## Assets still useful from the client

- Brand typeface (demo uses a stand-in matched to mockup cap height /
  tracking — swap the real face in and reset letter-spacing)
- Layered SVGs for the figures if available (optional — current exits
  are soft drift/dissolve and work with flat PNGs)

## Mobile

Desktop currently scales as a unit. A proper mobile composition
(re-stacked headline, fewer travellers) is a separate pass against the
site’s real breakpoints.
