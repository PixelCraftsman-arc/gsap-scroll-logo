# Hero → logo transition

Two presentation options from one shared GSAP sequence.

## Options

| URL | Mode |
|---|---|
| `/` | Chooser — pick a version |
| `/scroll.html` | Scroll-controlled (scrub + reverse) |
| `/auto.html` | Timed autoplay (~9.5s) with Replay |

## Run locally

```bash
python3 -m http.server 8000
```

## Shared system

`main.js` builds one choreography (`buildSequence`).  
`body[data-mode="scroll"|"auto"]` chooses how that timeline is driven.
