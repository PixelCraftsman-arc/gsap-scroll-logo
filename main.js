/**
 * Hero → logo sequence (scroll | auto).
 *
 * Clear phases, opaque figures, continuous logo stroke growth.
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
    { id: "carry-left", src: "fig-push-left", x: 75, y: 197, w: 106, h: 186, layer: "front" },
    { id: "carry-right", src: "fig-carry-right", x: 414, y: 190, w: 109, h: 193, layer: "front" },
    { id: "sit", src: "fig-sit", x: 710, y: 298, w: 116, h: 181, layer: "over-bar" },
    { id: "push-bar", src: "fig-push-bar", x: 96, y: 446, w: 98, h: 204, layer: "front" },
    { id: "measure", src: "fig-measure", x: 1044, y: 70, w: 102, h: 144, layer: "front" }
  ];

  const TRAVEL = ["bar2", "bar4", "v1", "v4"];

  /* Grow from the edge that touches the already-landed neighbour. */
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
    img.decode && img.decode().catch(() => {});
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
      opacity: 1,
      autoAlpha: 1
    });

    const hint = document.querySelector(".hint");
    if (hint) gsap.set(hint, { opacity: 1 });
  }

  resetScene();

  function buildSequence(tl) {
    /*
      Phase timing (timeline seconds):
      0.0–1.2   type clears
      0.9–2.4   figures leave (opaque)
      2.0–4.6   bars travel + settle
      4.5–6.2   logo strokes extend
      6.2–7.0   hold
    */

    /* —— 1. Type: slide fully off the 1280×741 stage, then hide —— */
    function clearLine(sel, at, move, dur) {
      tl.to(sel, { ...move, ease: "power2.inOut", duration: dur }, at);
      tl.set(sel, { autoAlpha: 0 }, at + dur);
    }

    clearLine(".l1", 0, { y: -520 }, 1.15);
    clearLine(".l2", 0.12, { x: 900 }, 1.15);
    clearLine(".l3", 0.2, { x: -720 }, 1.1);
    clearLine(".l4", 0.28, { y: 520 }, 1.2);

    /* —— 2. Figures: leave fully past the frame, then hide —— */
    function leave(id, at, move, dur) {
      tl.to(figEls[id], {
        ...move,
        opacity: 1,
        ease: "power2.inOut",
        duration: dur
      }, at);
      tl.set(figEls[id], { autoAlpha: 0 }, at + dur);
    }

    leave("push-bar", 0.95, { x: -480, y: 10 }, 1.25);
    leave("carry-left", 1.05, { x: -500, y: 16 }, 1.3);
    leave("measure", 1.15, { x: 420, y: -80 }, 1.2);
    leave("carry-right", 1.25, { x: -700, y: 20 }, 1.45);
    leave("sit", 1.55, { y: 560, x: -20 }, 1.25);

    /* —— 3. Bars: calm travel, no spin gimmicks / overshoot —— */
    function fly(key, at, dur) {
      const node = pieces[key];
      tl.call(() => node.classList.add("is-flying"), null, at);
      tl.to(node, { x: 0, ease: "power2.inOut", duration: dur }, at);
      tl.to(node, { y: 0, ease: "power2.inOut", duration: dur }, at);
      tl.to(
        node,
        {
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          ease: "power2.inOut",
          duration: dur * 0.85
        },
        at + dur * 0.08
      );
      tl.call(() => node.classList.remove("is-flying"), null, at + dur + 0.05);
    }

    fly("v1", 2.05, 2.2);
    fly("v4", 2.25, 2.05);
    fly("bar4", 2.4, 2.15);
    fly("bar2", 2.55, 2.0);

    /* —— 4. Logo: continuous stroke growth, one cascade —— */
    const cascade = [
      ["con1", 4.55, 0.35],
      ["bar1", 4.7, 0.5],
      ["c1", 4.75, 0.32],
      ["v2", 4.9, 0.55],
      ["con2", 4.95, 0.32],
      ["bar3", 5.1, 0.55],
      ["c3", 5.15, 0.32],
      ["v3", 5.3, 0.55],
      ["con3", 5.45, 0.3],
      ["c2", 5.55, 0.4]
    ];

    const byId = Object.fromEntries(EXTEND.map((e) => [e.id, e]));
    cascade.forEach(([id, at, dur]) => {
      const spec = byId[id];
      tl.to(
        pieces[id],
        { [spec.prop]: 1, ease: "power1.inOut", duration: dur },
        at
      );
    });

    const hint = document.querySelector(".hint");
    if (hint) tl.to(hint, { opacity: 0, duration: 0.6, ease: "power1.out" }, 0.2);

    tl.to({}, { duration: MODE === "auto" ? 1.4 : 0.85 }, 6.15);
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (MODE === "scroll") {
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".pin-wrap",
        start: "top top",
        end: "+=560%",
        pin: true,
        scrub: 1.15,
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
    const TARGET_SECONDS = 11;

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
      gsap.delayedCall(0.7, () => tl.play(0));
    }

    if (replayBtn) replayBtn.addEventListener("click", playOnce);
    playOnce();
  }
})();
