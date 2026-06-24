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
  let hoverIndex = -1;

  function catIndexAt(clientX, clientY) {
    if (currentScene !== "breed_select") return -1;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width * 128;
    if (x < 5 || x > 123) return -1;
    return Math.min(4, Math.max(0, Math.floor((x - 5) / 25)));
  }

  function reportHover() {
    if (typeof window.onBreedHover === "function") {
      const breeds = window.BREEDS || [];
      window.onBreedHover(hoverIndex, hoverIndex >= 0 ? breeds[hoverIndex] : null);
    }
  }

  canvas.addEventListener("mousemove", (e) => {
    const next = catIndexAt(e.clientX, e.clientY);
    if (next !== hoverIndex) {
      hoverIndex = next;
      canvas.classList.toggle("selectable", hoverIndex >= 0);
      reportHover();
      render(Date.now());
    }
  });

  canvas.addEventListener("mouseleave", () => {
    hoverIndex = -1;
    reportHover();
    render(Date.now());
  });

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

  /* ---------- Slugcat-inspired breed-specific cats ---------- */

  function drawCat(ox, oy, breedName) {
    if (!PAL[breedName]) {
      // eslint-disable-next-line no-console
      console.warn("[strayed] missing palette for breed:", breedName);
    }
    const p = PAL[breedName] || PAL.default;
    const f = p.fur, pt = p.points, e = p.eyes, n = p.nose, bl = p.belly;
    const s = p.stripes, o = p.p1, b = p.p2;
    const dk = "#1a1515";

    const breed = breedName || "default";
    const isMaineCoon = breed === "Maine Coon";
    const isSphynx = breed === "Sphynx";
    const isSiamese = breed === "Siamese";
    const isRagdoll = breed === "Ragdoll";
    const isCalico = breed === "Calico";

    // Body proportions by breed
    const bodyW = isMaineCoon ? 14 : isSphynx ? 9 : 12;
    const bodyH = isMaineCoon ? 10 : 8;
    const bodyX = ox + Math.floor((18 - bodyW) / 2);
    const bodyY = oy + 7;

    // Ears
    if (isSphynx) {
      // Large bat-like ears
      rect(ox + 4, oy + 0, 3, 6, pt);
      rect(ox + 11, oy + 0, 3, 6, pt);
      rect(ox + 5, oy + 1, 1, 4, f);
      rect(ox + 12, oy + 1, 1, 4, f);
    } else if (isMaineCoon) {
      // Tufted ears
      rect(ox + 4, oy - 1, 3, 5, pt);
      rect(ox + 11, oy - 1, 3, 5, pt);
      rect(ox + 5, oy + 1, 1, 3, f);
      rect(ox + 12, oy + 1, 1, 3, f);
      px(ox + 4, oy - 1, pt);
      px(ox + 13, oy - 1, pt);
    } else {
      // Small rounded ears
      rect(ox + 5, oy + 0, 3, 4, pt);
      rect(ox + 10, oy + 0, 3, 4, pt);
      rect(ox + 6, oy + 1, 1, 3, f);
      rect(ox + 11, oy + 1, 1, 3, f);
    }

    // Head (soft cat face with defined outline)
    const headW = isMaineCoon ? 14 : 12;
    const headX = ox + Math.floor((18 - headW) / 2);
    rect(headX, oy + 4, headW, 6, f);
    rect(headX - 1, oy + 6, headW + 2, 4, f);
    if (!isSphynx) {
      // soft cheek tufts
      px(headX - 1, oy + 7, f);
      px(headX + headW, oy + 7, f);
    }
    // chin shadow line
    rect(headX + 1, oy + 9, headW - 2, 1, pt);

    // Sphynx wrinkles
    if (isSphynx) {
      rect(headX + 4, oy + 5, 4, 1, pt);
      rect(headX + 3, oy + 7, 6, 1, pt);
    }

    // Point mask (Siamese/Ragdoll) — darker face
    if (isSiamese || isRagdoll) {
      rect(headX + 1, oy + 5, headW - 2, 5, pt);
      px(headX, oy + 8, pt);
      px(headX + headW - 1, oy + 8, pt);
    }

    // Eyes (cat-like almonds with vertical slit pupils)
    const eyeY = isSphynx ? oy + 6 : oy + 7;
    // left eye
    px(ox + 6, eyeY, e);
    px(ox + 7, eyeY, e);
    px(ox + 8, eyeY, e);
    px(ox + 6, eyeY + 1, e);
    px(ox + 7, eyeY + 1, dk); // pupil
    px(ox + 8, eyeY + 1, e);
    px(ox + 6, eyeY + 2, e);
    px(ox + 7, eyeY + 2, e);
    px(ox + 8, eyeY + 2, e);
    // right eye
    px(ox + 11, eyeY, e);
    px(ox + 12, eyeY, e);
    px(ox + 13, eyeY, e);
    px(ox + 11, eyeY + 1, e);
    px(ox + 12, eyeY + 1, dk); // pupil
    px(ox + 13, eyeY + 1, e);
    px(ox + 11, eyeY + 2, e);
    px(ox + 12, eyeY + 2, e);
    px(ox + 13, eyeY + 2, e);

    // Nose — small cat nose
    px(ox + 9, oy + 10, n);
    px(ox + 8, oy + 11, pt);
    px(ox + 9, oy + 11, pt);
    px(ox + 10, oy + 11, pt);

    // Mouth — small line
    px(ox + 8, oy + 11, pt);
    px(ox + 10, oy + 11, pt);

    // Whiskers (only on fuzzy breeds)
    if (!isSphynx) {
      rect(ox + 1, oy + 9, 2, 1, "#7a6a5a");
      rect(ox + 15, oy + 9, 2, 1, "#7a6a5a");
    }

    // Body (pear / slugcat blob)
    rect(bodyX, bodyY, bodyW, 3, f);
    rect(bodyX - 1, bodyY + 2, bodyW + 2, 3, f);
    rect(bodyX - 1, bodyY + 4, bodyW + 2, 3, f);
    rect(bodyX, bodyY + 6, bodyW, 2, f);

    // Belly patch
    rect(bodyX + 3, bodyY + 3, bodyW - 6, 4, bl);

    // Stripes (Maine Coon)
    if (s) {
      rect(bodyX + 1, bodyY + 1, bodyW - 2, 1, s);
      rect(bodyX, bodyY + 3, 3, 1, s);
      rect(bodyX + bodyW - 3, bodyY + 3, 3, 1, s);
      rect(bodyX + 2, bodyY + 5, bodyW - 4, 1, s);
    }

    // Calico patches
    if (o) rect(bodyX + 1, bodyY + 1, 3, 3, o);
    if (b) rect(bodyX + bodyW - 4, bodyY + 2, 3, 3, b);

    // Paws (tiny nubs)
    const pawY = bodyY + bodyH - 1;
    rect(ox + 6, pawY, 2, 2, pt);
    rect(ox + 10, pawY, 2, 2, pt);

    // Tail (breed-specific, curling out to the right)
    if (isMaineCoon) {
      // Bushy tail
      rect(bodyX + bodyW - 2, bodyY + 3, 3, 7, f);
      rect(bodyX + bodyW + 1, bodyY + 6, 3, 5, f);
      rect(bodyX + bodyW + 3, bodyY + 9, 2, 3, f);
      if (s) rect(bodyX + bodyW, bodyY + 5, 3, 1, s);
    } else if (isSiamese || isSphynx) {
      // Thin whip tail
      rect(bodyX + bodyW - 1, bodyY + 6, 1, 5, pt);
      rect(bodyX + bodyW, bodyY + 10, 1, 3, pt);
      rect(bodyX + bodyW + 1, bodyY + 12, 1, 2, pt);
    } else {
      // Medium curved tail
      rect(bodyX + bodyW - 1, bodyY + 5, 2, 5, f);
      rect(bodyX + bodyW + 1, bodyY + 8, 2, 3, f);
      rect(bodyX + bodyW + 2, bodyY + 10, 1, 2, pt);
    }
  }

  /* ---------- breed-specific silhouettes ---------- */

  function drawCatSilhouette(ox, oy, breedName) {
    const c = "#0a0a14";
    const breed = breedName || "default";
    const isMaineCoon = breed === "Maine Coon";
    const isSphynx = breed === "Sphynx";
    const isSiamese = breed === "Siamese";

    const bodyW = isMaineCoon ? 14 : isSphynx ? 9 : 12;
    const bodyH = isMaineCoon ? 10 : 8;
    const bodyX = ox + Math.floor((18 - bodyW) / 2);
    const bodyY = oy + 7;

    if (isSphynx) {
      rect(ox + 4, oy + 0, 3, 6, c);
      rect(ox + 11, oy + 0, 3, 6, c);
    } else if (isMaineCoon) {
      rect(ox + 4, oy - 1, 3, 5, c);
      rect(ox + 11, oy - 1, 3, 5, c);
      px(ox + 4, oy - 1, c);
      px(ox + 13, oy - 1, c);
    } else {
      rect(ox + 5, oy + 0, 3, 4, c);
      rect(ox + 10, oy + 0, 3, 4, c);
    }

    const headW = isMaineCoon ? 14 : 12;
    const headX = ox + Math.floor((18 - headW) / 2);
    rect(headX, oy + 4, headW, 6, c);
    rect(headX - 1, oy + 6, headW + 2, 4, c);
    rect(headX + 1, oy + 9, headW - 2, 1, c);
    if (isSphynx) {
      rect(headX + 4, oy + 5, 4, 1, c);
      rect(headX + 3, oy + 7, 6, 1, c);
    }

    rect(bodyX, bodyY, bodyW, 3, c);
    rect(bodyX - 1, bodyY + 2, bodyW + 2, 3, c);
    rect(bodyX - 1, bodyY + 4, bodyW + 2, 3, c);
    rect(bodyX, bodyY + 6, bodyW, 2, c);

    const pawY = bodyY + bodyH - 1;
    rect(ox + 6, pawY, 2, 2, c);
    rect(ox + 10, pawY, 2, 2, c);

    if (isMaineCoon) {
      rect(bodyX + bodyW - 2, bodyY + 3, 3, 6, c);
      rect(bodyX + bodyW - 1, bodyY + 1, 3, 4, c);
      rect(bodyX + bodyW, bodyY - 1, 2, 3, c);
    } else if (isSiamese || isSphynx) {
      rect(bodyX + bodyW - 1, bodyY + 4, 1, 5, c);
      rect(bodyX + bodyW, bodyY + 2, 1, 4, c);
      rect(bodyX + bodyW + 1, bodyY + 1, 1, 2, c);
    } else {
      rect(bodyX + bodyW - 2, bodyY + 4, 2, 5, c);
      rect(bodyX + bodyW - 1, bodyY + 2, 2, 3, c);
      rect(bodyX + bodyW, bodyY + 1, 1, 2, c);
    }

    // glowing eyes
    const eyeY = isSphynx ? oy + 6 : oy + 7;
    rect(ox + 6, eyeY, 3, 3, "#8abfdf");
    rect(ox + 11, eyeY, 3, 3, "#8abfdf");
    px(ox + 7, eyeY + 1, "#0a0a14");
    px(ox + 12, eyeY + 1, "#0a0a14");
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
      drawCatSilhouette(56, 50, currentState.cat ? currentState.cat.breed.name : "default");
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
      const isUnlocked = unlocked.has(breed.name);
      if (isUnlocked) {
        drawCat(x, 38, breed.name);
      } else {
        drawCatSilhouette(x, 38, breed.name);
      }

      // Name label only for unlocked cats
      if (isUnlocked) {
        ctx.save();
        ctx.scale(1 / SCALE, 1 / SCALE);
        ctx.fillStyle = "#d4c4b0";
        ctx.font = "10px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(breed.name, (x + 9) * SCALE, 73 * SCALE);
        ctx.restore();
      }

      // Hover highlight
      if (i === hoverIndex) {
        ctx.globalAlpha = 0.45 + 0.25 * Math.sin(t / 200);
        glow(x + 9, 60, 12, "#d4a05f", 0.25);
        rect(x + 2, 58, 16, 2, "#d4a05f");
        ctx.globalAlpha = 1;
      }
    });

    // Hint pointer
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
    drawCatSilhouette(54, 38, currentState.cat ? currentState.cat.breed.name : "default");
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
    const breed = currentState.cat && currentState.cat.breed ? currentState.cat.breed.name : "none";
    // eslint-disable-next-line no-console
    console.log("[strayed] render scene:", sceneName, "breed:", breed);
    render(Date.now());
  };

  /* ---------- subtle animation loop ---------- */

  setInterval(function () { render(Date.now()); }, 600);

  // Initial render
  render(Date.now());
})();
