/**
 * Hero → logo sequence (scroll | auto)
 *
 * Timeline units 0–100 = scroll progress 0–1.
 *
 *   0.00 – 0.30  type + illustrations exit (staggered, accelerating)
 *   0.25 – 0.45  black elements detach — counter-move, gather momentum
 *   0.40 – 0.85  pieces travel and converge
 *   0.85 – 1.00  final snap, settle, logo lock-up
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
  const logoFinal = document.getElementById("logo-final");
  const bgTwo = document.querySelector(".bg-two");

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

  const BLEED = {
    con1: { y: -1, h: 2 },
    con2: { y: -1, h: 2 },
    con3: { y: -1, h: 2 },
    c1: { x: -1, w: 2 },
    c2: { x: -1, w: 2 },
    c3: { x: -1, w: 2 }
  };

  const FIGS = [
    { id: "carry-left", src: "fig-push-left", x: 75, y: 197, w: 106, h: 186, layer: "front", side: "left" },
    { id: "carry-right", src: "fig-carry-right", x: 414, y: 190, w: 109, h: 193, layer: "front", side: "right" },
    { id: "sit", src: "fig-sit", x: 710, y: 298, w: 116, h: 181, layer: "over-bar", side: "right" },
    { id: "push-bar", src: "fig-push-bar", x: 96, y: 446, w: 98, h: 204, layer: "front", side: "left" },
    { id: "measure", src: "fig-measure", x: 1044, y: 70, w: 102, h: 144, layer: "front", side: "right" }
  ];

  const TRAVEL = ["bar2", "bar4", "v1", "v4"];

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
    img.src = "img/" + f.src + ".png?v=4";
    img.alt = "";
    img.draggable = false;
    wrap.appendChild(img);
    canvas.appendChild(wrap);
    figEls[f.id] = wrap;
  });

  /* Keep final mark above pieces once swapped in */
  if (logoFinal) canvas.appendChild(logoFinal);

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
        autoAlpha: 1,
        transformOrigin: "50% 50%"
      });
    });

    EXTEND.forEach(({ id, prop, origin }) => {
      const state = {
        autoAlpha: 1,
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
        autoAlpha: 1,
        scale: 1,
        left: f.x,
        top: f.y,
        width: f.w,
        height: f.h
      });
    });

    gsap.set([".l1", ".l2", ".l3", ".l4"], {
      x: 0,
      y: 0,
      autoAlpha: 1
    });

    if (logoFinal) gsap.set(logoFinal, { autoAlpha: 0 });
    if (bgTwo) gsap.set(bgTwo, { opacity: 0 });

    const hint = document.querySelector(".hint");
    if (hint) gsap.set(hint, { opacity: 1 });
  }

  resetScene();

  /**
   * Duration = 100 → maps 1:1 to scroll progress.
   */
  function buildSequence(tl) {
    const DETACH = { start: 25, end: 45 };
    const PHASE3 = { start: 40, end: 85 };
    const SNAP = 85;

    const accel = "power3.in";
    const glide = "power2.inOut";
    const snapEase = "power4.out";

    /* —— Phase 1 (0 → 0.30): type + people exit —— */
    tl.to(".l1", { y: "-18vh", ease: accel, duration: 24 }, 0);
    tl.to(".l1", { autoAlpha: 0, ease: "power2.in", duration: 4 }, 24);

    tl.to(".l2", { x: "20vw", y: "-6vh", ease: accel, duration: 22 }, 4);
    tl.to(".l2", { autoAlpha: 0, ease: "power2.in", duration: 4 }, 26);

    tl.to(".l3", { x: "-18vw", y: "8vh", ease: accel, duration: 20 }, 7);
    tl.to(".l3", { autoAlpha: 0, ease: "power2.in", duration: 4 }, 27);

    tl.to(".l4", { y: "18vh", ease: accel, duration: 18 }, 10);
    tl.to(".l4", { autoAlpha: 0, ease: "power2.in", duration: 4 }, 28);

    /*
     * People: design-pixel drift (not vw) so motion stays proportional inside
     * the scaled canvas. Hold until ~15%, then stagger exits through ~45%;
     * overflow on .canvas crops them — no opacity cut.
     */
    const figEase = "sine.inOut";
    const figExits = [
      ["push-bar", 15, 30, { x: -300, y: 65, rotation: -1.5 }],
      ["carry-left", 18, 28, { x: -340, y: 55, rotation: -2 }],
      ["measure", 20, 28, { x: 320, y: 45, rotation: 2 }],
      ["carry-right", 23, 26, { x: 280, y: 60, rotation: 1.5 }],
      ["sit", 26, 24, { x: 200, y: 85, rotation: 1 }]
    ];

    figExits.forEach(([id, at, dur, move]) => {
      tl.to(figEls[id], { ...move, ease: figEase, duration: dur }, at);
    });

    /*
     * Central bar figures stay in frame as pieces travel — fade them out
     * before stroke extension assembles the logo (phase 3 cascade ~52+).
     */
    const centralFigs = ["carry-right", "sit"];
    centralFigs.forEach((id, i) => {
      tl.to(figEls[id], { autoAlpha: 0, ease: "power1.in", duration: 12 }, 36 + i * 2);
    });

    const hint = document.querySelector(".hint");
    if (hint) tl.to(hint, { opacity: 0, duration: 6, ease: "power1.out" }, 4);

    /* —— Phase 2 (0.25 → 0.45): detach + counter-move —— */
    function detach(key, at, dur, anti) {
      const node = pieces[key];
      tl.call(() => node.classList.add("is-flying"), null, at);
      tl.to(
        node,
        {
          x: "+=" + anti.x,
          y: "+=" + anti.y,
          rotation: "+=" + anti.rot,
          ease: "sine.out",
          duration: dur
        },
        at
      );
    }

    detach("v1", DETACH.start, 8, { x: -12, y: 10, rot: -2 });
    detach("v4", DETACH.start + 3, 7, { x: 10, y: -8, rot: 2 });
    detach("bar4", DETACH.start + 6, 7, { x: 14, y: 6, rot: 0.8 });
    detach("bar2", DETACH.start + 9, 6, { x: -8, y: -6, rot: -1.2 });

    /* —— Phase 3 (0.40 → 0.85): travel + converge —— */
    function converge(key, at, dur) {
      const node = pieces[key];
      tl.to(node, { x: 0, ease: glide, duration: dur }, at);
      tl.to(node, { y: 0, ease: glide, duration: dur }, at);
      tl.to(
        node,
        {
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          ease: glide,
          duration: dur * 0.9
        },
        at + dur * 0.05
      );
    }

    const travelDur = PHASE3.end - PHASE3.start - 6;
    converge("v1", PHASE3.start, travelDur);
    converge("v4", PHASE3.start + 4, travelDur - 2);
    converge("bar4", PHASE3.start + 8, travelDur - 4);
    converge("bar2", PHASE3.start + 12, travelDur - 6);

    /* Remaining strokes extend while pieces converge */
    const cascade = [
      ["con1", 52, 6],
      ["bar1", 55, 8],
      ["c1", 56, 5],
      ["v2", 59, 8],
      ["con2", 61, 5],
      ["bar3", 64, 8],
      ["c3", 66, 5],
      ["v3", 69, 8],
      ["con3", 74, 5],
      ["c2", 78, 6]
    ];
    const byId = Object.fromEntries(EXTEND.map((e) => [e.id, e]));
    cascade.forEach(([id, at, dur]) => {
      const spec = byId[id];
      tl.to(pieces[id], { [spec.prop]: 1, ease: "power1.inOut", duration: dur }, at);
    });

    tl.call(() => {
      ["bar2", "bar4", "v1", "v4"].forEach((k) => pieces[k]?.classList.remove("is-flying"));
    }, null, PHASE3.end);

    /* —— Phase 4 (0.85 → 1.00): snap + settle —— */
    if (bgTwo) {
      tl.to(bgTwo, { opacity: 1, ease: "power1.inOut", duration: 10 }, SNAP);
    }

    const allPieceNodes = Object.keys(LOGO).map((k) => pieces[k]);

    /* Final alignment snap on the travelling pieces */
    tl.to(allPieceNodes, {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      ease: snapEase,
      duration: 5
    }, SNAP);

    if (logoFinal) {
      tl.to(logoFinal, { autoAlpha: 1, ease: "power1.out", duration: 4 }, SNAP + 4);
      tl.to(allPieceNodes, { autoAlpha: 0, ease: "power1.out", duration: 3 }, SNAP + 6);
      tl.fromTo(
        logoFinal,
        { scale: 1.018 },
        { scale: 1, ease: "power2.out", duration: 8 },
        SNAP + 6
      );
    } else {
      tl.fromTo(
        allPieceNodes,
        { scale: 1.018 },
        { scale: 1, ease: "power2.out", duration: 8 },
        SNAP + 6
      );
    }

    tl.to({}, { duration: 6 }, 94);
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (MODE === "scroll") {
    const progressEl = document.getElementById("scroll-progress");
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".pin-wrap",
        start: "top top",
        end: "+=620%",
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (progressEl) {
            progressEl.textContent = Math.round(self.progress * 100) + "%";
          }
        }
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
    const TARGET_SECONDS = 12;

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
      gsap.delayedCall(0.6, () => tl.play(0));
    }

    if (replayBtn) replayBtn.addEventListener("click", playOnce);
    playOnce();
  }
})();
