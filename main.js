/**
 * Hero → logo sequence (scroll | auto)
 *
 * Timeline units 0–100 = scroll progress 0–1.
 *
 *   0.00 – 0.30  type + illustrations exit (staggered, accelerating)
 *   0.25 – 0.45  black elements detach — counter-move, gather momentum
 *   0.40 – 0.66  original pieces travel and lock into logo skeleton
 *   0.67 – 0.88  finishing geometry extends from connected pieces (scale)
 *   0.88 – 0.94  full lock-up, seamless swap to final mark
 *   0.94 – 1.00  final logo held centred
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
    { id: "sit", src: "fig-sit", x: 718, y: 306, w: 116, h: 181, layer: "over-bar", side: "right" },
    { id: "push-bar", src: "fig-push-bar", x: 96, y: 446, w: 98, h: 204, layer: "front", side: "left" },
    { id: "measure", src: "fig-measure", x: 1044, y: 70, w: 102, h: 144, layer: "front", side: "right" }
  ];

  const TRAVEL = ["bar2", "bar4", "v1", "v4"];

  const STROKE = {
    /* Left glyph — extensions from landed bar2 / bar4 */
    con1: { prop: "scaleY", origin: "50% 100%" },
    bar1: { prop: "scaleY", origin: "50% 100%" },
    bar3: { prop: "scaleY", origin: "50% 0%" },
    con2: { prop: "scaleX", origin: "0% 50%" },
    con3: { prop: "scaleX", origin: "0% 50%" },
    /* Right glyph — extensions from landed v1 / v4 */
    c1: { prop: "scaleY", origin: "50% 0%" },
    v2: { prop: "scaleY", origin: "50% 0%" },
    v3: { prop: "scaleY", origin: "50% 0%" },
    c3: { prop: "scaleY", origin: "50% 0%" },
    c2: { prop: "scaleY", origin: "50% 100%" }
  };

  const STROKE_IDS = Object.keys(STROKE);
  const STROKE_EASE = "none";

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
  STROKE_IDS.forEach((id) => pieces[id].classList.add("piece--stroke"));

  FIGS.forEach((f) => {
    const wrap = document.createElement("div");
    wrap.className = "fig fig--" + f.layer;
    wrap.dataset.fig = f.id;
    wrap.style.left = f.x + "px";
    wrap.style.top = f.y + "px";
    wrap.style.width = f.w + "px";
    wrap.style.height = f.h + "px";

    const img = document.createElement("img");
    img.src = "img/" + f.src + ".png?v=5";
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

    STROKE_IDS.forEach((id) => {
      const { prop, origin } = STROKE[id];
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
    const TRAVEL_END = 66;
    const EXT_START = 67;
    const LOCKUP = 94;

    const accel = "power3.in";
    const glide = "power2.inOut";

    /*
     * Typography: drift off-frame first, then a longer sine tail fade so letters
     * do not pop off between ~29–31% scroll.
     */
    const typeFade = "sine.inOut";
    const typeFadeDur = 12;

    tl.to(".l1", { y: "-18vh", ease: accel, duration: 24 }, 0);
    tl.to(".l1", { autoAlpha: 0, ease: typeFade, duration: typeFadeDur }, 16);

    tl.to(".l2", { x: "20vw", y: "-6vh", ease: accel, duration: 22 }, 4);
    tl.to(".l2", { autoAlpha: 0, ease: typeFade, duration: typeFadeDur }, 18);

    tl.to(".l3", { x: "-18vw", y: "8vh", ease: accel, duration: 20 }, 7);
    tl.to(".l3", { autoAlpha: 0, ease: typeFade, duration: typeFadeDur }, 20);

    tl.to(".l4", { y: "18vh", ease: accel, duration: 18 }, 10);
    tl.to(".l4", { autoAlpha: 0, ease: typeFade, duration: typeFadeDur }, 22);

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
     * before stroke extension assembles the logo (phase 3 ~50%+).
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

    /* —— Phase 3 (0.40 → 0.66): original pieces travel —— */
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

    const travelStart = 40;
    const travelDur = TRAVEL_END - travelStart - 6;
    const v1At = travelStart;
    const v4At = travelStart + 2;
    const bar4At = travelStart + 4;
    const bar2At = travelStart + 6;
    const v1Dur = travelDur;
    const v4Dur = travelDur - 2;
    const bar4Dur = travelDur - 4;
    const bar2Dur = travelDur - 6;

    converge("v1", v1At, v1Dur);
    converge("v4", v4At, v4Dur);
    converge("bar4", bar4At, bar4Dur);
    converge("bar2", bar2At, bar2Dur);

    tl.set(
      TRAVEL.map((k) => pieces[k]),
      { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      TRAVEL_END
    );

    tl.call(() => {
      TRAVEL.forEach((k) => pieces[k]?.classList.remove("is-flying"));
    }, null, TRAVEL_END);

    /*
     * Phase 3b (0.67 → 0.88): finishing geometry — already at final positions,
     * hidden until anchors lock, then scale out from shared edges (ease none).
     */
    function drawStrokes(at, segments) {
      segments.forEach(([id, offset, dur]) => {
        const spec = STROKE[id];
        tl.to(
          pieces[id],
          { [spec.prop]: 1, ease: STROKE_EASE, duration: dur },
          at + offset
        );
      });
    }

    /* Left E — fork up/down from bar2, bridges from bar4 */
    drawStrokes(EXT_START, [
      ["con1", 0, 5],
      ["bar1", 0.6, 10],
      ["bar3", 0, 10]
    ]);

    drawStrokes(EXT_START + 1, [
      ["con2", 0.8, 5],
      ["con3", 0, 5]
    ]);

    /* Right M — columns pour from v1 rail, cap from v4, base tie-in last */
    drawStrokes(EXT_START + 0.5, [
      ["c1", 0, 4],
      ["v2", 0.7, 12],
      ["v3", 1.1, 12]
    ]);

    drawStrokes(EXT_START + 1.5, [["c3", 0, 4]]);

    drawStrokes(EXT_START + 6, [["c2", 0, 8]]);

    /* —— Phase 4 (0.86 → 1.00): lock-up + final mark —— */
    if (bgTwo) {
      tl.to(bgTwo, { opacity: 1, ease: "none", duration: 6 }, 86);
    }

    const allPieceNodes = Object.keys(LOGO).map((k) => pieces[k]);

    if (logoFinal) {
      tl.set(logoFinal, { autoAlpha: 1 }, LOCKUP);
      tl.set(allPieceNodes, { autoAlpha: 0 }, LOCKUP);
    }

    tl.to({}, { duration: 6 }, LOCKUP);
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
        invalidateOnRefresh: true,
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
