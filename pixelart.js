/* STRAYED — cozy 8-bit pixel art scenes
 * Renders atmospheric pixel illustrations on a 128x80 canvas.
 * Each game scene maps to a drawn scene with breed-specific cat sprites.
 */
(function () {
  const canvas = document.getElementById("pixel-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const W = 128, H = 80;
  const SCALE = 3;
  const BUFFER_W = W * SCALE;
  const BUFFER_H = H * SCALE;
  canvas.width = BUFFER_W;
  canvas.height = BUFFER_H;
  ctx.scale(SCALE, SCALE);
  ctx.imageSmoothingEnabled = false;

  let currentScene = "start";
  let currentState = { cat: null };

  /* ---------- aspect-fit resize so scene fills the stage and stays centered ---------- */

  function resizeCanvas() {
    const stage = document.getElementById("scene-stage");
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const scale = Math.min(rect.width / BUFFER_W, rect.height / BUFFER_H, 4);
    const displayScale = Math.max(1, scale);
    canvas.style.width = `${BUFFER_W * displayScale}px`;
    canvas.style.height = `${BUFFER_H * displayScale}px`;
  }

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("orientationchange", () => setTimeout(resizeCanvas, 150));
  resizeCanvas();

  /* ---------- drawing primitives ---------- */

  function rect(x, y, w, h, c) {
    if (!c) return;
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  }

  function px(x, y, c) { rect(x, y, 1, 1, c); }

  function circle(cx, cy, r, c) {
    for (let y = -r; y <= r; y++)
      for (let x = -r; x <= r; x++)
        if (x * x + y * y <= r * r) px(cx + x, cy + y, c);
  }

  function glow(cx, cy, r, c, a) {
    ctx.globalAlpha = a;
    circle(cx, cy, r, c);
    ctx.globalAlpha = 1;
  }

  function dither(x, y, w, h, c1, c2) {
    for (let py = 0; py < h; py++)
      for (let pxi = 0; pxi < w; pxi++)
        px(x + pxi, y + py, (pxi + py) % 2 === 0 ? c1 : c2);
  }

  /* ---------- cat palettes by breed ---------- */

  const PAL = {
    Siamese:      { fur:"#e8dcc0", points:"#4a3020", eyes:"#6a9adf", nose:"#d8a0a8", belly:"#f0e8d4", stripes:null,  p1:null,      p2:null      },
    Ragdoll:      { fur:"#f2ede2", points:"#6a5a4a", eyes:"#5a8acf", nose:"#d8a0a8", belly:"#faf6ee", stripes:null,  p1:null,      p2:null      },
    "Maine Coon": { fur:"#9a7a5a", points:"#5a4030", eyes:"#7abf6a", nose:"#c89888", belly:"#aa8a6a", stripes:"#5a4030", p1:null,  p2:null      },
    Sphynx:       { fur:"#d8a890", points:"#a87860", eyes:"#e4b86a", nose:"#986850", belly:"#e0b8a0", stripes:null,  p1:null,      p2:null      },
    Calico:       { fur:"#f2ede2", points:"#3a3030", eyes:"#7abf6a", nose:"#d8a0a8", belly:"#faf6ee", stripes:null,  p1:"#d4884a", p2:"#3a3030" },
    default:      { fur:"#a89888", points:"#7a6a5a", eyes:"#d4a05f", nose:"#d8a0a8", belly:"#b8a898", stripes:null,  p1:null,      p2:null      }
  };

  /* ---------- draw a cute sitting cat at (ox, oy) ---------- */

  function drawCat(ox, oy, breedName) {
    const p = PAL[breedName] || PAL.default;
    const f = p.fur, pt = p.points, e = p.eyes, n = p.nose, bl = p.belly;
    const s = p.stripes, o = p.p1, b = p.p2;
    const dk = "#1a1515";

    // Ears (rounded, wider set)
    rect(ox + 4, oy + 0, 3, 4, pt);
    rect(ox + 5, oy + 1, 1, 3, f);
    rect(ox + 13, oy + 0, 3, 4, pt);
    rect(ox + 14, oy + 1, 1, 3, f);

    // Head (wide round face, soft cheeks)
    rect(ox + 4, oy + 3, 12, 6, f);
    rect(ox + 3, oy + 4, 14, 5, f);
    rect(ox + 2, oy + 6, 16, 4, f);
    rect(ox + 4, oy + 9, 12, 2, pt); // muzzle mask
    px(ox + 3, oy + 8, f);
    px(ox + 16, oy + 8, f);

    // Eyes (large, low)
    rect(ox + 6, oy + 5, 3, 4, e);
    rect(ox + 11, oy + 5, 3, 4, e);
    rect(ox + 7, oy + 6, 1, 2, dk);
    rect(ox + 12, oy + 6, 1, 2, dk);

    // Nose + mouth
    rect(ox + 9, oy + 8, 2, 1, n);
    px(ox + 9, oy + 9, pt);
    px(ox + 10, oy + 9, pt);

    // Whiskers
    rect(ox + 1, oy + 8, 2, 1, "#7a6a5a");
    rect(ox + 1, oy + 9, 2, 1, "#7a6a5a");
    rect(ox + 17, oy + 8, 2, 1, "#7a6a5a");
    rect(ox + 17, oy + 9, 2, 1, "#7a6a5a");

    // Neck (small visible connector)
    rect(ox + 7, oy + 10, 6, 2, f);

    // Body (tapered oval, not a rectangle)
    rect(ox + 5, oy + 11, 10, 3, f);   // narrow shoulders
    rect(ox + 4, oy + 13, 12, 4, f);   // widest midsection
    rect(ox + 5, oy + 17, 10, 2, f);   // taper to hips
    rect(ox + 7, oy + 13, 6, 4, bl);   // rounded belly

    // Stripes (tabby) — curved on back
    if (s) {
      rect(ox + 6, oy + 12, 2, 1, s);
      rect(ox + 10, oy + 12, 2, 1, s);
      rect(ox + 5, oy + 14, 3, 1, s);
      rect(ox + 10, oy + 14, 3, 1, s);
      rect(ox + 7, oy + 16, 6, 1, s);
    }

    // Calico patches
    if (o) rect(ox + 4, oy + 12, 3, 3, o);
    if (b) rect(ox + 11, oy + 13, 4, 4, b);

    // Paws (rounded, close together)
    rect(ox + 6, oy + 17, 3, 2, pt);
    rect(ox + 11, oy + 17, 3, 2, pt);

    // Tail (curled around body)
    rect(ox + 15, oy + 14, 2, 5, f);
    rect(ox + 16, oy + 12, 2, 3, f);
    rect(ox + 17, oy + 11, 1, 2, pt);
  }

  /* ---------- cat silhouette (for window scenes) ---------- */

  function drawCatSilhouette(ox, oy) {
    const c = "#0a0a14";
    rect(ox + 4, oy + 0, 3, 4, c);
    rect(ox + 13, oy + 0, 3, 4, c);
    rect(ox + 4, oy + 3, 12, 6, c);
    rect(ox + 3, oy + 4, 14, 5, c);
    rect(ox + 2, oy + 6, 16, 4, c);
    rect(ox + 4, oy + 9, 12, 2, c);
    px(ox + 3, oy + 8, c);
    px(ox + 16, oy + 8, c);
    rect(ox + 7, oy + 10, 6, 2, c);
    rect(ox + 5, oy + 11, 10, 3, c);
    rect(ox + 4, oy + 13, 12, 4, c);
    rect(ox + 5, oy + 17, 10, 2, c);
    rect(ox + 6, oy + 17, 3, 2, c);
    rect(ox + 11, oy + 17, 3, 2, c);
    rect(ox + 15, oy + 14, 2, 5, c);
    rect(ox + 16, oy + 12, 2, 3, c);
    // glowing eyes
    rect(ox + 7, oy + 6, 1, 2, "#8abfdf");
    rect(ox + 12, oy + 6, 1, 2, "#8abfdf");
  }

  /* ---------- reusable scene elements ---------- */

  function drawMoon(cx, cy, r) {
    glow(cx, cy, r + 4, "#f5e6c8", 0.07);
    glow(cx, cy, r + 2, "#f5e6c8", 0.14);
    circle(cx, cy, r, "#f5e6c8");
    circle(cx - 2, cy - 1, 2, "#e8d5a8");
    circle(cx + 2, cy + 2, 1, "#e8d5a8");
  }

  function drawTwinkleStars(list, t) {
    list.forEach(([x, y]) => {
      if ((x * 7 + y * 3 + Math.floor(t / 600)) % 5 < 3) px(x, y, "#e8e4dc");
    });
  }

  function drawLampGlow(cx, cy, t) {
    const pulse = 0.5 + 0.5 * Math.sin(t / 800);
    glow(cx, cy, 14, "#f0c878", 0.04 + 0.03 * pulse);
    glow(cx, cy, 9, "#f0c878", 0.08 + 0.05 * pulse);
    glow(cx, cy, 5, "#f5d890", 0.15 + 0.08 * pulse);
    circle(cx, cy, 2, "#f5e6c8");
  }

  function drawBricks(x, y, w, h, base, mortar) {
    rect(x, y, w, h, base);
    for (let row = 0; row < h; row += 6) {
      rect(x, y + row, w, 1, mortar);
      const off = (row / 6) % 2 === 0 ? 0 : 8;
      for (let bx = off; bx < w; bx += 16) rect(x + bx, y + row, 1, 6, mortar);
    }
  }

  function drawWindow(x, y, w, h, frameColor, t) {
    rect(x, y, w, h, "#1a1a3e");
    drawTwinkleStars([[x + 4, y + 3], [x + 10, y + 6], [x + 15, y + 2], [x + 6, y + 9], [x + 18, y + 5], [x + 22, y + 3]], t);
    drawMoon(x + w - 8, y + 8, 4);
    rect(x, y, w, 2, frameColor);
    rect(x, y + h - 2, w, 2, frameColor);
    rect(x, y, 2, h, frameColor);
    rect(x + w - 2, y, 2, h, frameColor);
    rect(x + w / 2 - 1, y, 2, h, frameColor);
    rect(x, y + h / 2 - 1, w, 2, frameColor);
  }

  function drawPiano(x, y, w) {
    const h = 28;
    rect(x, y, w, h, "#2a2020");
    rect(x, y, w, 3, "#3d2e2e");
    rect(x + 2, y + 3, w - 4, 10, "#e8e4dc");
    for (let kx = x + 6; kx < x + w - 4; kx += 8) rect(kx, y + 3, 3, 6, "#1a1515");
    for (let kx = x + 2; kx < x + w - 4; kx += 5) rect(kx, y + 3, 1, 10, "#c0bcb4");
    rect(x + 2, y + h, 3, 12, "#2a2020");
    rect(x + w - 5, y + h, 3, 12, "#2a2020");
  }

  function drawFloor(y, c1, c2) {
    rect(0, y, W, H - y, c1);
    dither(0, y, W, 3, c1, c2);
    for (let x = 0; x < W; x += 20) rect(x, y + 4, 1, H - y - 4, c2);
  }

  /* ---------- scenes ---------- */

  function sceneAlley(t, silhouette) {
    // Sky gradient
    rect(0, 0, W, 15, "#0a0a1e");
    dither(0, 15, W, 5, "#0a0a1e", "#0e0e26");
    rect(0, 20, W, 15, "#0e0e26");
    dither(0, 35, W, 5, "#0e0e26", "#12122e");
    rect(0, 40, W, 12, "#12122e");

    drawTwinkleStars([[10, 4], [25, 7], [40, 3], [55, 5], [70, 8], [85, 4], [115, 10], [60, 12], [30, 10], [95, 6]], t);
    drawMoon(105, 14, 7);

    // Brick wall (left)
    drawBricks(0, 28, 30, 42, "#3a2a28", "#241818");

    // Streetlamp
    rect(98, 30, 3, 40, "#3a3434");
    rect(94, 26, 11, 4, "#4a4444");
    rect(96, 24, 7, 3, "#5a5050");
    drawLampGlow(99, 26, t);

    // Ground
    rect(0, 70, W, 10, "#1a1612");
    rect(0, 70, W, 1, "#2a221c");
    for (let x = 0; x < W; x += 6) rect(x, 74, 4, 1, "#221c18");

    // Instrument case
    rect(48, 64, 28, 8, "#3a2820");
    rect(48, 64, 28, 2, "#4a3828");
    rect(48, 67, 28, 1, "#2a1c14");
    rect(60, 64, 2, 8, "#2a1c14");

    // Cat — silhouette or full color
    if (silhouette) {
      drawCatSilhouette(56, 50);
    } else {
      drawCat(56, 50, currentState.cat ? currentState.cat.breed.name : "default");
    }
  }

  function sceneApartment(t, opts) {
    opts = opts || {};
    // Wall
    rect(0, 0, W, 56, "#2a2438");
    for (let x = 0; x < W; x += 16) rect(x, 0, 1, 56, "#241e30");

    // Window or door
    if (opts.door) {
      rect(8, 18, 24, 38, "#3a2a20");
      rect(10, 20, 20, 34, "#2a1c14");
      rect(28, 36, 2, 2, "#d4a05f");
    } else if (opts.window !== false) {
      drawWindow(8, 6, 36, 28, "#4a3a4e", t);
    }

    // Floor
    drawFloor(56, "#241c1a", "#1c1614");

    // Rug
    rect(30, 62, 60, 12, "#3a2a3a");
    rect(32, 64, 56, 8, "#4a3a4a");

    // Piano
    drawPiano(82, 36, 40);

    // Lamp
    rect(50, 30, 2, 26, "#3a3434");
    rect(46, 28, 10, 3, "#4a4444");
    drawLampGlow(51, 30, t);

    // Warm room glow
    glow(64, 40, 40, "#d4a05f", 0.04);
    glow(64, 40, 25, "#d4a05f", 0.06);

    // Suitcase
    if (opts.suitcase) {
      rect(58, 58, 24, 10, "#4a3828");
      rect(58, 58, 24, 2, "#5a4838");
      rect(68, 56, 4, 2, "#3a2818");
    }

    // Emergency tint
    if (opts.tint === "emergency") {
      ctx.globalAlpha = 0.12;
      rect(0, 0, W, H, "#c84040");
      ctx.globalAlpha = 1;
    }

    // Cat
    const catX = opts.door ? 45 : 55;
    if (opts.cat !== false) {
      drawCat(catX, 36, currentState.cat ? currentState.cat.breed.name : "default");
    }
  }

  function sceneBreedSelect(t) {
    // Apartment at night, empty of the player cat
    sceneApartment(t, { cat: false, window: false });

    // Draw a row of five cats sitting on the floor
    const breeds = window.BREEDS || [];
    const unlocked = new Set((currentState.unlockedBreeds || []));
    const positions = [5, 30, 55, 80, 105];
    breeds.forEach((breed, i) => {
      const x = positions[i];
      if (unlocked.has(breed.name)) {
        drawCat(x, 38, breed.name);
      } else {
        drawCatSilhouette(x, 38);
      }
    });

    // Subtle pointer on the center cat
    const pulse = 0.5 + 0.5 * Math.sin(t / 500);
    ctx.globalAlpha = 0.4 + 0.3 * pulse;
    px(64, 34, "#d4a05f");
    px(64, 35, "#d4a05f");
    px(63, 35, "#d4a05f");
    px(65, 35, "#d4a05f");
    ctx.globalAlpha = 1;
  }

  function scenePiano(t) {
    rect(0, 0, W, H, "#1a1620");

    // Sheet music
    rect(6, 4, 30, 20, "#e8e4dc");
    rect(6, 4, 30, 2, "#c0bcb4");
    for (let y = 8; y < 22; y += 3) rect(8, y, 26, 1, "#7a7670");
    rect(12, 11, 2, 2, "#1a1515");
    rect(18, 9, 2, 2, "#1a1515");
    rect(24, 12, 2, 2, "#1a1515");
    rect(28, 10, 2, 2, "#1a1515");

    // Piano keys
    rect(4, 28, W - 8, 44, "#e8e4dc");
    for (let x = 4; x < W - 4; x += 6) rect(x, 28, 1, 44, "#b0aca4");
    for (let x = 8; x < W - 8; x += 12) rect(x, 28, 4, 24, "#1a1515");
    rect(4, 28, W - 8, 2, "#c0bcb4");

    // Cat on keys
    drawCat(50, 8, currentState.cat ? currentState.cat.breed.name : "default");
  }

  function sceneStudio(t) {
    // Soundproofed studio walls
    rect(0, 0, W, H, "#1e1a28");
    for (let x = 0; x < W; x += 12) {
      rect(x, 0, 6, H, "#1a1622");
      rect(x + 6, 0, 1, H, "#14101c");
    }

    // Mixing desk
    rect(0, 48, W, 4, "#2a2028");
    rect(0, 52, W, 28, "#241a22");
    for (let x = 8; x < W - 8; x += 16) {
      rect(x, 54, 4, 10, "#3a3040");
      rect(x + 1, 56, 2, 2, "#d4a05f");
    }

    // Booth window
    rect(70, 10, 50, 34, "#1a1a2e");
    rect(72, 12, 46, 30, "#252538");
    rect(70, 10, 50, 2, "#3a3448");
    rect(70, 42, 50, 2, "#3a3448");
    rect(70, 10, 2, 34, "#3a3448");
    rect(118, 10, 2, 34, "#3a3448");
    // Mic stand silhouette in booth
    rect(90, 24, 1, 18, "#0f0f18");
    rect(85, 20, 12, 5, "#0f0f18");
    glow(91, 22, 5, "#8a6a9a", 0.15);

    // Warm desk lamp
    drawLampGlow(25, 42, t);

    // Cat on the mixing desk
    drawCat(50, 30, currentState.cat ? currentState.cat.breed.name : "default");
  }

  function sceneDesk(t) {
    // Wall
    rect(0, 0, W, 50, "#2a2438");
    for (let x = 0; x < W; x += 16) rect(x, 0, 1, 50, "#241e30");

    // Floor
    drawFloor(50, "#241c1a", "#1c1614");

    // Desk
    rect(0, 48, W, 6, "#3a2a20");
    rect(0, 48, W, 2, "#4a3828");

    // Monitor
    rect(44, 14, 40, 30, "#1a1a22");
    rect(46, 16, 36, 24, "#2a2a3e");
    glow(64, 28, 20, "#5a6a9a", 0.12);
    glow(64, 28, 12, "#6a7aaa", 0.2);
    rect(60, 20, 8, 12, "#3a4a6a");
    rect(62, 44, 4, 6, "#3a3434");

    // Warm desk lamp glow
    drawLampGlow(20, 40, t);

    // Cat on desk
    drawCat(48, 28, currentState.cat ? currentState.cat.breed.name : "default");
  }

  function sceneWindow(t) {
    // Dark wall
    rect(0, 0, W, H, "#1e1828");

    // Large window
    rect(14, 6, 100, 52, "#1a1a3e");
    drawTwinkleStars([[20, 10], [35, 8], [55, 12], [75, 6], [95, 10], [45, 14], [85, 16], [25, 16], [65, 8], [105, 12]], t);
    drawMoon(95, 16, 8);

    // Window frame
    const fr = "#4a3a4e";
    rect(14, 6, 100, 2, fr);
    rect(14, 56, 100, 2, fr);
    rect(14, 6, 2, 52, fr);
    rect(112, 6, 2, 52, fr);
    rect(63, 6, 2, 52, fr);
    rect(14, 31, 100, 2, fr);

    // Windowsill
    rect(10, 58, 108, 4, "#3a2a30");

    // Floor
    rect(0, 62, W, 18, "#1c1620");

    // Warm interior glow at edges
    glow(10, 70, 20, "#d4a05f", 0.05);
    glow(118, 70, 20, "#d4a05f", 0.05);

    // Cat silhouette on sill
    drawCatSilhouette(54, 38);
  }

  function sceneEnding(t) {
    const key = currentState.endingKey;
    if (key === "permanent_resident") {
      scenePiano(t);
      glow(64, 40, 50, "#d4a05f", 0.08);
      glow(64, 40, 30, "#e4b86a", 0.05);
    } else if (key === "free_spirit") {
      sceneAlley(t, true);
    } else if (key === "album_dedication") {
      sceneDesk(t);
      ctx.globalAlpha = 0.12;
      rect(0, 0, W, H, "#3a4a7a");
      ctx.globalAlpha = 1;
    } else if (key === "reassigned") {
      sceneWindow(t);
    } else {
      sceneApartment(t, {});
    }
  }

  /* ---------- scene map ---------- */

  const SCENE_MAP = {
    breed_select: sceneBreedSelect,
    act1_intro: function (t) { sceneAlley(t, true); },
    act1_morning: function (t) { sceneApartment(t, {}); },
    rehearsal_invasion: scenePiano,
    label_call: sceneDesk,
    emergency: function (t) { sceneApartment(t, { tint: "emergency" }); },
    neighbor: function (t) { sceneApartment(t, { door: true }); },
    gig_conflict: function (t) { sceneApartment(t, { suitcase: true }); },
    recording_trip: function (t) { sceneApartment(t, { suitcase: true }); },
    quiet_night: sceneWindow,
    ending: sceneEnding
  };

  /* ---------- render ---------- */

  function render(t) {
    ctx.clearRect(0, 0, W, H);
    const fn = SCENE_MAP[currentScene] || sceneAlley;
    fn(t || 0);
  }

  /* ---------- entry point (called by game.js) ---------- */

  window.renderScene = function (sceneName, state) {
    currentScene = sceneName;
    currentState = state || { cat: null };
    render(Date.now());
  };

  /* ---------- subtle animation loop ---------- */

  setInterval(function () { render(Date.now()); }, 600);

  // Initial render
  render(Date.now());
})();
