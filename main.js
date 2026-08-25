/**
 * Shared hero → logo sequence.
 * Modes (body[data-mode]):
 *   scroll — scrubbed to scroll position, reversible
 *   auto   — plays once on a timed timeline (replay available)
 *
 * Client revisions:
 * - Figures match the flat lay; seated woman sits in front of her bar
 * - Opaque figure backs so type never shows through
 * - Type exits by sliding off (no blur / dissolve)
 * - Figures exit by walking off-frame while staying fully opaque
 * - Remaining logo strokes extend as continuous lines from landed pieces
 */

(() => {
gsap.registerPlugin(ScrollTrigger);

const MODE = document.body.dataset.mode === "auto" ? "auto" : "scroll";
const DW = 1280;
const DH = 741;
const canvas = document.getElementById("canvas");

if (!canvas) return;

const pieces = {};
const figEls = {};

const LOGO = {
  bar1: { x: 368, y: 238, w: 267, h: 61 },
  bar2: { x: 368, y: 306, w: 267, h: 61 },
  bar3: { x: 368, y: 375, w: 267, h: 61 },
  bar4: { x: 368, y: 443, w: 267, h: 61 },
  con1: { x: 368, y: 299, w: 54, h: 7 },
  con2: { x: 582, y: 367, w: 53, h: 8 },
  con3: { x: 368, y: 436, w: 53, h: 7 },
  v1: { x: 643, y: 238, w: 61, h: 266 },
  v2: { x: 711, y: 238, w: 61, h: 266 },
  v3: { x: 780, y: 238, w: 61, h: 266 },
  v4: { x: 849, y: 238, w: 61, h: 266 },
  c1: { x: 704, y: 238, w: 7, h: 61 },
  c2: { x: 772, y: 450, w: 8, h: 54 },
  c3: { x: 841, y: 238, w: 8, h: 61 }
};

/* Flat-lay hero bars (3 deconstructed pieces + measured bar). */
const HERO = {
  bar2: { x: 149, y: 243, w: 282, h: 44, rot: -3.6 },
  bar4: { x: 524, y: 399, w: 655, h: 47, rot: 0 },
  v4: { x: 997, y: 71, w: 45, h: 130, rot: 0 },
  v1: { x: 162, y: 487, w: 42, h: 153, rot: 0 }
};

const BLEED = {
  con1: { y: -1, h: 2 },
  con2: { y: -1, h: 2 },
  con3: { y: -1, h: 2 },
  c1: { x: -1, w: 2 },
  c2: { x: -1, w: 2 },
  c3: { x: -1, w: 2 }
};

/* Positions matched to the flat lay; sit stays in front of bar4. */
const FIGS = [
  { id: "carry-left", src: "fig-push-left", x: 75, y: 197, w: 106, h: 186, layer: "front" },
  { id: "carry-right", src: "fig-carry-right", x: 414, y: 190, w: 109, h: 193, layer: "front" },
  { id: "sit", src: "fig-sit", x: 718, y: 300, w: 116, h: 181, layer: "over-bar" },
  { id: "push-bar", src: "fig-push-bar", x: 96, y: 446, w: 98, h: 204, layer: "front" },
  { id: "measure", src: "fig-measure", x: 1044, y: 70, w: 102, h: 144, layer: "front" }
];

const TRAVEL = ["bar2", "bar4", "v1", "v4"];

/* Remaining strokes grow out of landed pieces as continuous lines. */
const EXTEND = [
  { id: "con1", prop: "scaleY", origin: "50% 100%" },
  { id: "bar1", prop: "scaleY", origin: "50% 100%" },
  { id: "con2", prop: "scaleY", origin: "50% 0%" },
  { id: "bar3", prop: "scaleX", origin: "100% 50%" },
  { id: "con3", prop: "scaleY", origin: "50% 0%" },
  { id: "c1", prop: "scaleX", origin: "0% 50%" },
  { id: "v2", prop: "scaleY", origin: "50% 0%" },
  { id: "c3", prop: "scaleX", origin: "100% 50%" },
  { id: "v3", prop: "scaleY", origin: "50% 0%" },
  { id: "c2", prop: "scaleX", origin: "0% 50%" }
];

function makePiece(id, r) {
  const b = BLEED[id] || {};
  const d = document.createElement("div");
  d.className = "piece";
  d.dataset.piece = id;
  d.style.left = r.x + (b.x || 0) + "px";
  d.style.top = r.y + (b.y || 0) + "px";
  d.style.width = r.w + (b.w || 0) + "px";
  d.style.height = r.h + (b.h || 0) + "px";
  canvas.appendChild(d);
  pieces[id] = d;
}

Object.keys(LOGO).forEach((k) => makePiece(k, LOGO[k]));

FIGS.forEach((f) => {
  const wrap = document.createElement("div");
  wrap.className = "fig fig--" + f.layer;
  wrap.dataset.fig = f.id;
  wrap.style.left = f.x + "px";
  wrap.style.top = f.y + "px";
  wrap.style.width = f.w + "px";
  wrap.style.height = f.h + "px";

  const img = document.createElement("img");
  img.src = "img/" + f.src + ".png";
  img.alt = "";
  img.draggable = false;
  wrap.appendChild(img);
  canvas.appendChild(wrap);
  figEls[f.id] = wrap;
});

function fit() {
  const s = Math.min(window.innerWidth / DW, window.innerHeight / DH);
  canvas.style.transform = "scale(" + s + ")";
}
fit();
window.addEventListener("resize", () => {
  fit();
  if (MODE === "scroll") ScrollTrigger.refresh();
});

function heroOffset(key) {
  const a = HERO[key];
  const b = LOGO[key];
  return {
    x: a.x + a.w / 2 - (b.x + b.w / 2),
    y: a.y + a.h / 2 - (b.y + b.h / 2),
    scaleX: a.w / b.w,
    scaleY: a.h / b.h,
    rotation: a.rot
  };
}

function resetScene() {
  TRAVEL.forEach((k) => {
    pieces[k].classList.remove("is-flying");
    gsap.set(pieces[k], {
      ...heroOffset(k),
      opacity: 1,
      transformOrigin: "50% 50%"
    });
  });

  EXTEND.forEach(({ id, prop, origin }) => {
    const state = {
      opacity: 1,
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      transformOrigin: origin
    };
    state[prop] = 0;
    gsap.set(pieces[id], state);
  });

  FIGS.forEach((f) => {
    gsap.set(figEls[f.id], {
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 1,
      scale: 1,
      left: f.x,
      top: f.y,
      width: f.w,
      height: f.h,
      clearProps: "clipPath,filter"
    });
  });

  gsap.set([".l1", ".l2", ".l3", ".l4"], {
    x: 0,
    y: 0,
    opacity: 1,
    clearProps: "filter,letterSpacing,clipPath"
  });

  const hint = document.querySelector(".hint");
  if (hint) gsap.set(hint, { opacity: 1, clearProps: "transform" });
}

resetScene();

function buildSequence(tl) {
  /* ---- Typography: slide cleanly off-frame (no blur / dissolve) ---- */
  tl.to(".l1", { y: -260, ease: "power3.in", duration: 0.95 }, 0.02);
  tl.to(".l2", { x: 420, ease: "power3.in", duration: 0.95 }, 0.10);
  tl.to(".l3", { x: -380, ease: "power3.in", duration: 0.9 }, 0.16);
  tl.to(".l4", { y: 280, ease: "power3.in", duration: 1.0 }, 0.22);

  /* ---- Figures: leave the frame fully opaque (no fade) ---- */
  function exitFig(id, at, vars, dur) {
    tl.to(figEls[id], {
      ...vars,
      opacity: 1,
      ease: "power2.in",
      duration: dur
    }, at);
  }

  /* Carriers release, then walk off left / right while solid. */
  tl.to(figEls["carry-left"], {
    x: -14, rotation: -2, duration: 0.28, ease: "sine.out"
  }, 0.48);
  tl.to(figEls["carry-right"], {
    x: 12, rotation: 2, duration: 0.28, ease: "sine.out"
  }, 0.52);

  exitFig("carry-left", 0.82, { x: -320, y: 24, rotation: -4 }, 1.15);
  exitFig("carry-right", 0.95, { x: -480, y: 36, rotation: 3 }, 1.35);

  tl.to(figEls.measure, {
    x: -8, rotation: -3, duration: 0.28, ease: "sine.out"
  }, 0.62);
  exitFig("measure", 1.05, { x: 260, y: -40, rotation: 5 }, 1.05);

  tl.to(figEls["push-bar"], {
    x: 10, duration: 0.24, ease: "sine.out"
  }, 0.42);
  exitFig("push-bar", 0.72, { x: -280, y: 20, rotation: -3 }, 1.1);

  /* Seated woman stays in front of the bar, then steps off with it. */
  tl.to(figEls.sit, {
    y: 6, duration: 0.35, ease: "sine.in"
  }, 1.15);
  exitFig("sit", 1.45, { y: 320, x: -24, rotation: 8 }, 1.05);

  /* ---- Travelling bars ---- */
  function flyBar(key, opts) {
    const node = pieces[key];
    const { antiAt, anti, flyAt, flyDur, midRot, xEase, yEase } = opts;

    tl.call(() => node.classList.add("is-flying"), null, antiAt);

    if (anti) {
      tl.to(node, {
        x: "+=" + anti.x,
        y: "+=" + anti.y,
        rotation: "+=" + (anti.rot || 0),
        duration: anti.dur,
        ease: "sine.out"
      }, antiAt);
    }

    const land = flyAt + flyDur;

    tl.to(node, { x: 0, duration: flyDur, ease: xEase }, flyAt);
    tl.to(node, { y: 0, duration: flyDur, ease: yEase }, flyAt);

    if (midRot != null) {
      tl.to(node, {
        rotation: midRot,
        duration: flyDur * 0.45,
        ease: "sine.inOut"
      }, flyAt);
      tl.to(node, {
        rotation: 0,
        duration: flyDur * 0.55,
        ease: "power2.out"
      }, flyAt + flyDur * 0.45);
    } else {
      tl.to(node, {
        rotation: 0,
        duration: flyDur * 0.75,
        ease: "power2.inOut"
      }, flyAt + flyDur * 0.15);
    }

    tl.to(node, {
      scaleX: 1,
      scaleY: 1,
      duration: flyDur * 0.7,
      ease: "power2.inOut"
    }, flyAt + flyDur * 0.18);

    tl.to(node, {
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 0.2,
      ease: "power1.out"
    }, land - 0.06);

    tl.to(node, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.32,
      ease: "power3.out"
    }, land + 0.1);

    tl.call(() => node.classList.remove("is-flying"), null, land + 0.3);
  }

  flyBar("v1", {
    antiAt: 0.68,
    anti: { x: -8, y: 12, rot: -2, dur: 0.26 },
    flyAt: 1.0,
    flyDur: 2.1,
    midRot: -6,
    xEase: "power3.inOut",
    yEase: "power2.inOut"
  });

  flyBar("bar4", {
    antiAt: 1.3,
    anti: { x: 14, y: 6, rot: 0.4, dur: 0.3 },
    flyAt: 1.65,
    flyDur: 1.9,
    midRot: 2,
    xEase: "power2.inOut",
    yEase: "power3.inOut"
  });

  flyBar("v4", {
    antiAt: 1.05,
    anti: { x: 6, y: -10, rot: 2, dur: 0.24 },
    flyAt: 1.35,
    flyDur: 1.8,
    midRot: 8,
    xEase: "power2.inOut",
    yEase: "power4.inOut"
  });

  flyBar("bar2", {
    antiAt: 1.45,
    anti: { x: -5, y: -8, rot: -1.2, dur: 0.28 },
    flyAt: 1.8,
    flyDur: 1.7,
    midRot: -4,
    xEase: "power3.inOut",
    yEase: "power2.inOut"
  });

  /* ---- Logo completion: strokes extend as continuous lines ---- */
  const extensions = [
    { id: "con1", at: 3.0, dur: 0.28 },
    { id: "bar1", at: 3.12, dur: 0.42 },
    { id: "c1", at: 3.14, dur: 0.26 },
    { id: "v2", at: 3.26, dur: 0.44 },
    { id: "con2", at: 3.28, dur: 0.26 },
    { id: "bar3", at: 3.38, dur: 0.46 },
    { id: "c3", at: 3.4, dur: 0.26 },
    { id: "v3", at: 3.52, dur: 0.44 },
    { id: "con3", at: 3.66, dur: 0.24 },
    { id: "c2", at: 3.76, dur: 0.3 }
  ];

  const extendMap = Object.fromEntries(EXTEND.map((e) => [e.id, e]));

  extensions.forEach(({ id, at, dur }) => {
    const spec = extendMap[id];
    tl.to(pieces[id], {
      [spec.prop]: 1,
      ease: "power2.inOut",
      duration: dur
    }, at);
  });

  const hint = document.querySelector(".hint");
  if (hint) {
    tl.to(hint, { opacity: 0, duration: 0.5, ease: "power1.in" }, 0.15);
  }

  tl.to({}, { duration: MODE === "auto" ? 1.2 : 0.7 }, 4.4);
}

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (MODE === "scroll") {
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: ".pin-wrap",
      start: "top top",
      end: "+=420%",
      pin: true,
      scrub: 0.85,
      anticipatePin: 1
    }
  });

  buildSequence(tl);
  window.__tl = tl;

  if (reduced) {
    tl.scrollTrigger.kill();
    tl.progress(1);
  }
}

if (MODE === "auto") {
  const statusEl = document.getElementById("auto-status");
  const replayBtn = document.getElementById("btn-replay");
  const TARGET_SECONDS = 9.5;

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    paused: true,
    onComplete: () => {
      if (statusEl) statusEl.textContent = "Complete";
      if (replayBtn) replayBtn.hidden = false;
    }
  });

  buildSequence(tl);
  tl.timeScale(tl.duration() / TARGET_SECONDS);
  window.__tl = tl;

  function playOnce() {
    if (replayBtn) replayBtn.hidden = true;
    if (statusEl) statusEl.textContent = "Playing";

    Object.values(pieces).forEach((n) => n.classList.remove("is-flying"));
    resetScene();

    if (reduced) {
      tl.progress(1);
      if (statusEl) statusEl.textContent = "Complete";
      if (replayBtn) replayBtn.hidden = false;
      return;
    }

    tl.invalidate().pause(0);
    gsap.delayedCall(0.55, () => tl.play(0));
  }

  if (replayBtn) replayBtn.addEventListener("click", playOnce);
  playOnce();
}
})();
