/**
 * Hand-tuned scroll transition: hero composition → assembled mark.
 *
 * Philosophy:
 * - Anticipation before every release
 * - Uneven, musical stagger (not equal intervals)
 * - Each bar has its own flight personality
 * - Figures drift and dissolve — no fake walk cycles
 * - Missing strokes settle in from nearby landed pieces
 * - Soft landings with a touch of overshoot
 */

gsap.registerPlugin(ScrollTrigger);

const DW = 1280;
const DH = 741;
const canvas = document.getElementById("canvas");
const pieces = {};

/* ---- mark geometry (design space) -------------------------------- */
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

const HERO = {
  bar2: { x: 149, y: 243, w: 282, h: 44, rot: -3.6 },
  bar4: { x: 524, y: 399, w: 655, h: 47, rot: 0 },
  v4: { x: 997, y: 71, w: 45, h: 130, rot: 0 },
  v1: { x: 162, y: 487, w: 42, h: 153, rot: 0 }
};

/* Bleed connectors into neighbours so scaled seams stay black. */
const BLEED = {
  con1: { y: -1, h: 2 },
  con2: { y: -1, h: 2 },
  con3: { y: -1, h: 2 },
  c1: { x: -1, w: 2 },
  c2: { x: -1, w: 2 },
  c3: { x: -1, w: 2 }
};

const FIGS = [
  { id: "push-bar", src: "fig-push-bar", x: 96, y: 446, w: 98, h: 204 },
  { id: "measure", src: "fig-measure", x: 1044, y: 70, w: 102, h: 144 },
  { id: "carry-left", src: "fig-push-left", x: 75, y: 197, w: 106, h: 186 },
  { id: "sit", src: "fig-sit", x: 718, y: 303, w: 116, h: 181 },
  { id: "carry-right", src: "fig-carry-right", x: 414, y: 190, w: 109, h: 193 }
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

const figEls = {};
FIGS.forEach((f) => {
  const wrap = document.createElement("div");
  wrap.className = "fig";
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
  ScrollTrigger.refresh();
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

const TRAVEL = ["bar2", "bar4", "v1", "v4"];
TRAVEL.forEach((k) => gsap.set(pieces[k], heroOffset(k)));

/* Missing strokes start near their parent bar, slightly soft. */
const SETTLE = [
  { id: "con1", from: "bar2", ox: 0, oy: 18 },
  { id: "bar1", from: "bar2", ox: 0, oy: 36 },
  { id: "con2", from: "bar2", ox: 12, oy: -14 },
  { id: "bar3", from: "bar2", ox: 40, oy: -8 },
  { id: "con3", from: "bar4", ox: -10, oy: -22 },
  { id: "c1", from: "v1", ox: -16, oy: 8 },
  { id: "v2", from: "v1", ox: -28, oy: 20 },
  { id: "c3", from: "v4", ox: 16, oy: 8 },
  { id: "v3", from: "v4", ox: 28, oy: 24 },
  { id: "c2", from: "v2", ox: -12, oy: -18 }
];

SETTLE.forEach(({ id, ox, oy }) => {
  gsap.set(pieces[id], {
    opacity: 0,
    x: ox,
    y: oy,
    scale: 0.88,
    transformOrigin: "50% 50%"
  });
});

/* ---- timeline ---------------------------------------------------- */
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

/* 1. Type dissolves — soft blur, uneven cascade, letter-spacing breathe */
tl.to(".l1", {
  y: -48,
  opacity: 0,
  filter: "blur(8px)",
  letterSpacing: "12px",
  ease: "power3.in",
  duration: 1.1
}, 0.05);

tl.to(".l2", {
  x: 56,
  y: -24,
  opacity: 0,
  filter: "blur(7px)",
  letterSpacing: "6px",
  ease: "power3.in",
  duration: 1.05
}, 0.18);

tl.to(".l3", {
  x: -64,
  opacity: 0,
  filter: "blur(7px)",
  letterSpacing: "10px",
  ease: "power3.in",
  duration: 1.0
}, 0.28);

tl.to(".l4", {
  y: 56,
  opacity: 0,
  filter: "blur(9px)",
  letterSpacing: "18px",
  ease: "power2.in",
  duration: 1.15
}, 0.36);

/* 2. Figures — character exits, no walk gimmicks */
function releaseFig(id, at, vars, dur) {
  tl.to(figEls[id], {
    ...vars,
    ease: "power2.inOut",
    duration: dur
  }, at);
}

/* Carriers ease back as the bar starts to lift, then drift apart. */
tl.to(figEls["carry-left"], {
  x: -18,
  y: 6,
  rotation: -3,
  duration: 0.35,
  ease: "sine.out"
}, 0.55);

tl.to(figEls["carry-right"], {
  x: 14,
  y: 8,
  rotation: 2,
  duration: 0.35,
  ease: "sine.out"
}, 0.58);

releaseFig("carry-left", 0.95, {
  x: -160,
  y: 40,
  opacity: 0,
  scale: 0.94,
  rotation: -8
}, 1.35);

releaseFig("carry-right", 1.05, {
  x: 120,
  y: 70,
  opacity: 0,
  scale: 0.93,
  rotation: 6
}, 1.4);

/* Measuring figure: small lean away, then dissolve upward-right. */
tl.to(figEls.measure, {
  x: -10,
  rotation: -4,
  duration: 0.4,
  ease: "sine.out"
}, 0.7);

releaseFig("measure", 1.15, {
  x: 90,
  y: -50,
  opacity: 0,
  scale: 0.9,
  rotation: 8
}, 1.2);

/* Bottom pusher steps aside and fades. */
tl.to(figEls["push-bar"], {
  x: 12,
  duration: 0.3,
  ease: "sine.out"
}, 0.5);

releaseFig("push-bar", 0.85, {
  x: -130,
  y: 30,
  opacity: 0,
  scale: 0.95,
  rotation: -5
}, 1.25);

/* Seated figure: bar leaves first feel — she settles, then slips down. */
tl.to(figEls.sit, {
  y: 10,
  rotation: 2,
  duration: 0.45,
  ease: "sine.in"
}, 1.2);

releaseFig("sit", 1.55, {
  y: 220,
  x: -30,
  opacity: 0,
  rotation: 12,
  scale: 0.96
}, 1.15);

/* 3. Bars — anticipation, then flight with personality */
function flyBar(key, opts) {
  const node = pieces[key];
  const {
    antiAt,
    anti,
    flyAt,
    flyDur,
    midRot,
    xEase,
    yEase
  } = opts;

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

  tl.to(node, {
    x: 0,
    duration: flyDur,
    ease: xEase
  }, flyAt);

  tl.to(node, {
    y: 0,
    duration: flyDur,
    ease: yEase
  }, flyAt);

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

  /* Soft settle — tiny overshoot, then rest. */
  tl.to(node, {
    scaleX: 1.025,
    scaleY: 1.025,
    duration: 0.22,
    ease: "power1.out"
  }, land - 0.08);

  tl.to(node, {
    scaleX: 1,
    scaleY: 1,
    duration: 0.35,
    ease: "power3.out"
  }, land + 0.12);

  tl.call(() => node.classList.remove("is-flying"), null, land + 0.35);
}

/* Push bar — longest path, leaves earliest, slight spin. */
flyBar("v1", {
  antiAt: 0.72,
  anti: { x: -10, y: 14, rot: -2, dur: 0.28 },
  flyAt: 1.05,
  flyDur: 2.15,
  midRot: -7,
  xEase: "power3.inOut",
  yEase: "power2.inOut"
});

/* Long seat bar — heavy, slower horizontal glide. */
flyBar("bar4", {
  antiAt: 1.35,
  anti: { x: 16, y: 8, rot: 0.5, dur: 0.32 },
  flyAt: 1.7,
  flyDur: 1.95,
  midRot: 2.5,
  xEase: "power2.inOut",
  yEase: "power3.inOut"
});

/* Measured bar — quick, almost snappy arc. */
flyBar("v4", {
  antiAt: 1.1,
  anti: { x: 8, y: -12, rot: 3, dur: 0.26 },
  flyAt: 1.4,
  flyDur: 1.85,
  midRot: 9,
  xEase: "power2.inOut",
  yEase: "power4.inOut"
});

/* Carried bar — last to go, keeps a hint of its tilt mid-air. */
flyBar("bar2", {
  antiAt: 1.5,
  anti: { x: -6, y: -10, rot: -1.5, dur: 0.3 },
  flyAt: 1.85,
  flyDur: 1.75,
  midRot: -5,
  xEase: "power3.inOut",
  yEase: "power2.inOut"
});

/* 4. Remaining strokes arrive from nearby — ink settling, not UI wipes */
const arrivals = [
  { id: "con1", at: 3.05, dur: 0.55 },
  { id: "bar1", at: 3.18, dur: 0.7 },
  { id: "c1", at: 3.22, dur: 0.5 },
  { id: "v2", at: 3.34, dur: 0.72 },
  { id: "con2", at: 3.4, dur: 0.48 },
  { id: "c3", at: 3.46, dur: 0.5 },
  { id: "bar3", at: 3.55, dur: 0.75 },
  { id: "v3", at: 3.62, dur: 0.7 },
  { id: "con3", at: 3.78, dur: 0.45 },
  { id: "c2", at: 3.88, dur: 0.55 }
];

arrivals.forEach(({ id, at, dur }) => {
  tl.to(pieces[id], {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    duration: dur,
    ease: "power3.out"
  }, at);
});

tl.to(".hint", { opacity: 0, duration: 0.6, ease: "power1.in" }, 0.2);

/* Quiet hold on the finished mark. */
tl.to({}, { duration: 0.7 }, 4.5);

window.__tl = tl;

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  tl.scrollTrigger.kill();
  tl.progress(1);
}
