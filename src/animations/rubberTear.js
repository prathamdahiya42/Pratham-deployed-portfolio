/**
 * Rubber Membrane Tear Reveal — Animation Module
 *
 * Covers each `.crt-card` project card with a dark rubbery canvas overlay.
 * Users click-drag to stretch and tear the membrane, revealing the card.
 *
 * Safety rules:
 *   - Card content is ALWAYS visible in the DOM — the canvas sits ON TOP
 *   - All code wrapped in try/catch — a JS error never hides a card
 *   - If card selector finds nothing, logs a warning and exits
 */
import gsap from 'gsap';

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */

/** Draw a rounded-rect path (does NOT fill or stroke — caller does that) */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Pre-generate a static noise ImageData for the rubbery grain texture.
 */
function createNoiseImageData(ctx, width, height) {
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);
    if (x % 3 === 0 && y % 3 === 0) {
      const alpha = Math.floor(Math.random() * 14); // slightly more visible grain
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = alpha;
    }
  }
  return imageData;
}

/* ═══════════════════════════════════════════════════════
   Draw the membrane onto a canvas
   ═══════════════════════════════════════════════════════ */

function drawMembrane(ctx, width, height, state, noiseData) {
  ctx.clearRect(0, 0, width, height);

  ctx.save();
  roundRect(ctx, 0, 0, width, height, 16);
  ctx.clip();

  // ─── Base membrane fill — MORE OPAQUE ───
  ctx.fillStyle = '#080d1c';
  ctx.fillRect(0, 0, width, height);

  // Second pass for extra opacity
  ctx.fillStyle = 'rgba(6, 10, 24, 0.7)';
  ctx.fillRect(0, 0, width, height);

  // ─── Grain texture ───
  if (noiseData) {
    ctx.putImageData(noiseData, 0, 0);
  }

  // ─── Subtle surface pattern — horizontal lines for rubber feel ───
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.012)';
  ctx.lineWidth = 0.5;
  for (let y = 0; y < height; y += 6) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // ─── Edge rim highlight ───
  ctx.strokeStyle = 'rgba(100, 180, 255, 0.09)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 1, 1, width - 2, height - 2, 15);
  ctx.stroke();

  // ─── Top sheen ───
  const sheen = ctx.createLinearGradient(0, 0, 0, height * 0.25);
  sheen.addColorStop(0, 'rgba(150, 200, 255, 0.06)');
  sheen.addColorStop(1, 'rgba(150, 200, 255, 0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, width, height * 0.25);

  // ─── Drag stretch glow ───
  if (state.isDragging && state.dragDist > 5) {
    const intensity = Math.min(state.dragDist / 100, 1);
    const glowRadius = 70 + 70 * intensity;

    // Bright stretch point
    const grad = ctx.createRadialGradient(
      state.mx, state.my, 0,
      state.mx, state.my, glowRadius
    );
    grad.addColorStop(0, `rgba(100, 220, 200, ${0.35 * intensity})`);
    grad.addColorStop(0.3, `rgba(100, 220, 200, ${0.15 * intensity})`);
    grad.addColorStop(1, 'rgba(100, 220, 200, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Stress lines radiating from pull point
    if (state.dragDist > 15) {
      ctx.strokeStyle = `rgba(100, 220, 200, ${0.08 * intensity})`;
      ctx.lineWidth = 0.5;
      const numLines = 12;
      for (let i = 0; i < numLines; i++) {
        const angle = (Math.PI * 2 / numLines) * i;
        const len = 30 + 40 * intensity;
        ctx.beginPath();
        ctx.moveTo(state.mx, state.my);
        ctx.lineTo(
          state.mx + Math.cos(angle) * len,
          state.my + Math.sin(angle) * len
        );
        ctx.stroke();
      }
    }
  }

  // ─── Tear hole (destination-out punch) ───
  if (state.tearPolygon && state.tearPolygon.length > 2) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(state.tearPolygon[0].x, state.tearPolygon[0].y);
    for (let i = 1; i < state.tearPolygon.length; i++) {
      ctx.lineTo(state.tearPolygon[i].x, state.tearPolygon[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // Torn edge glow
    ctx.strokeStyle = 'rgba(100, 220, 200, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(100, 220, 200, 0.3)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(state.tearPolygon[0].x, state.tearPolygon[0].y);
    for (let i = 1; i < state.tearPolygon.length; i++) {
      ctx.lineTo(state.tearPolygon[i].x, state.tearPolygon[i].y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

/* ═══════════════════════════════════════════════════════
   Tear polygon generation
   ═══════════════════════════════════════════════════════ */

const jitterCache = new WeakMap();

function getJitterValues(canvas, steps) {
  if (jitterCache.has(canvas)) return jitterCache.get(canvas);
  const values = [];
  for (let i = 0; i <= steps; i++) {
    values.push(1 + (Math.random() * 0.4 - 0.2));
  }
  jitterCache.set(canvas, values);
  return values;
}

function buildTearPolygon(state, width, height, canvas) {
  const cx = state.startX;
  const cy = state.startY;
  const angle = Math.atan2(state.my - cy, state.mx - cx);
  const progress = Math.min(state.dragDist / 80, 1);
  const radius = Math.max(width, height) * 1.5 * progress;
  const points = [{ x: cx, y: cy }];
  const spread = Math.PI * 0.95;
  const steps = 24;
  const jitters = getJitterValues(canvas, steps);

  for (let i = 0; i <= steps; i++) {
    const a = angle - spread / 2 + (spread / steps) * i;
    const r = radius * jitters[i];
    points.push({
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r,
    });
  }

  state.tearPolygon = points;
}

/* ═══════════════════════════════════════════════════════
   Complete tear — cloth-rip shatter from mouse position
   ═══════════════════════════════════════════════════════ */

function completeTear(canvas, state, card) {
  state.isTorn = true;
  state.isDragging = false;

  const w = canvas.width;
  const h = canvas.height;
  const dpr = state.dpr || 1;
  const parentEl = canvas.parentElement;

  // Tear origin in CSS pixels
  const originX = state.startX / dpr;
  const originY = state.startY / dpr;

  // Create a grid of small shards (5 cols × 4 rows = 20 pieces)
  const cols = 5;
  const rows = 4;
  const cellW = w / cols;
  const cellH = h / rows;

  const shards = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      shards.push({
        x: col * cellW,
        y: row * cellH,
        w: cellW,
        h: cellH,
        // Center of this shard in CSS pixels
        cx: (col * cellW + cellW / 2) / dpr,
        cy: (row * cellH + cellH / 2) / dpr,
      });
    }
  }

  // Sort shards by distance from tear origin — closest shatter first
  shards.sort((a, b) => {
    const dA = Math.hypot(a.cx - originX, a.cy - originY);
    const dB = Math.hypot(b.cx - originX, b.cy - originY);
    return dA - dB;
  });

  shards.forEach((shard, i) => {
    try {
      const shardCanvas = document.createElement('canvas');
      shardCanvas.width = Math.ceil(shard.w);
      shardCanvas.height = Math.ceil(shard.h);
      const sctx = shardCanvas.getContext('2d');
      sctx.drawImage(
        canvas,
        shard.x, shard.y, shard.w, shard.h,
        0, 0, shard.w, shard.h
      );

      const cssW = shard.w / dpr;
      const cssH = shard.h / dpr;
      const cssX = shard.x / dpr;
      const cssY = shard.y / dpr;

      shardCanvas.style.cssText = `
        position: absolute;
        top: ${cssY}px;
        left: ${cssX}px;
        width: ${cssW}px;
        height: ${cssH}px;
        pointer-events: none;
        z-index: 20;
      `;

      parentEl.appendChild(shardCanvas);

      // Direction: from tear origin THROUGH this shard's center, outward
      const dx = shard.cx - originX;
      const dy = shard.cy - originY;
      const dist = Math.hypot(dx, dy) || 1;
      const dirX = dx / dist;
      const dirY = dy / dist;

      // Fly distance — farther shards fly farther
      const flyDist = 60 + Math.random() * 100 + dist * 0.4;

      // Gravity pull — pieces fall downward slightly
      const gravityY = 30 + Math.random() * 50;

      // Random rotation
      const rot = (Math.random() - 0.5) * 60;

      // Stagger delay — closest shards leave first, rippling outward
      const maxDist = Math.hypot(w / dpr, h / dpr);
      const staggerDelay = (dist / maxDist) * 0.15;

      gsap.to(shardCanvas, {
        x: dirX * flyDist,
        y: dirY * flyDist + gravityY,
        rotation: rot,
        opacity: 0,
        scale: 0.4 + Math.random() * 0.3,
        duration: 0.5 + Math.random() * 0.2,
        ease: 'power3.out',
        delay: staggerDelay,
        onComplete: () => shardCanvas.remove(),
      });
    } catch (e) {
      console.warn('[RubberTear] Shard animation failed:', e);
    }
  });

  // Remove the main canvas + hint after shards fly away
  gsap.delayedCall(0.8, () => {
    canvas.remove();
    const hint = card.querySelector('.membrane-hint');
    if (hint) hint.remove();
  });

  // Mark card as fully interactive — this also removes blur via CSS
  card.classList.add('membrane-torn');
}

/* ═══════════════════════════════════════════════════════
   Snap-back animation (drag released before threshold)
   ═══════════════════════════════════════════════════════ */

function snapBack(ctx, canvas, state, noiseData) {
  const startPolygon = state.tearPolygon.map(p => ({ ...p }));
  const startDist = state.dragDist;
  const duration = 320;
  const startTime = performance.now();
  const w = canvas.width;
  const h = canvas.height;

  function animSnap(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);

    state.tearPolygon = startPolygon.map(p => ({
      x: p.x + (state.startX - p.x) * ease,
      y: p.y + (state.startY - p.y) * ease,
    }));
    state.dragDist = startDist * (1 - ease);

    drawMembrane(ctx, w, h, state, noiseData);

    if (progress < 1) {
      requestAnimationFrame(animSnap);
    } else {
      state.tearPolygon = [];
      state.dragDist = 0;
      drawMembrane(ctx, w, h, state, noiseData);
    }
  }

  requestAnimationFrame(animSnap);
}

/* ═══════════════════════════════════════════════════════
   Setup membrane for a single card
   ═══════════════════════════════════════════════════════ */

function setupMembrane(card) {
  try {
    const computedPos = getComputedStyle(card).position;
    if (computedPos === 'static') {
      card.style.position = 'relative';
    }
    card.style.overflow = 'hidden';

    // Add blur class to card content while membrane is present
    const contentEl = card.querySelector('.crt-card-content');
    if (contentEl) {
      contentEl.classList.add('membrane-blurred');
    }

    // Create canvas overlay
    const canvas = document.createElement('canvas');
    canvas.className = 'rubber-membrane-canvas';
    const ctx = canvas.getContext('2d');

    // Size at device pixel ratio for crispness
    const rect = card.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);

    // Pre-bake noise
    const noiseData = createNoiseImageData(ctx, Math.round(rect.width), Math.round(rect.height));

    // Per-card state
    const state = {
      isDragging: false,
      startX: 0,
      startY: 0,
      mx: 0,
      my: 0,
      dragDist: 0,
      tearPolygon: [],
      isTorn: false,
      dpr,
    };

    // Draw initial membrane
    drawMembrane(ctx, canvas.width, canvas.height, state, noiseData);

    // Inject hint label
    const hint = document.createElement('div');
    hint.className = 'membrane-hint';
    hint.textContent = 'drag to reveal';
    card.appendChild(hint);

    // Insert canvas
    card.appendChild(canvas);

    // ═══════════════════════════════════════════════════
    // Pointer events
    // ═══════════════════════════════════════════════════

    function handlePointerDown(clientX, clientY) {
      if (state.isTorn) return;
      const r = canvas.getBoundingClientRect();
      state.startX = (clientX - r.left) * dpr;
      state.startY = (clientY - r.top) * dpr;
      state.mx = state.startX;
      state.my = state.startY;
      state.isDragging = true;
      canvas.style.cursor = 'grabbing';
    }

    function handlePointerMove(clientX, clientY) {
      if (!state.isDragging || state.isTorn) return;
      const r = canvas.getBoundingClientRect();
      state.mx = (clientX - r.left) * dpr;
      state.my = (clientY - r.top) * dpr;
      state.dragDist = Math.hypot(state.mx - state.startX, state.my - state.startY);

      if (state.dragDist > 15 * dpr) {
        buildTearPolygon(state, canvas.width, canvas.height, canvas);
      }

      drawMembrane(ctx, canvas.width, canvas.height, state, noiseData);

      if (state.dragDist > 80 * dpr) {
        completeTear(canvas, state, card);
        cleanup();
      }
    }

    function handlePointerUp() {
      if (!state.isDragging) return;
      state.isDragging = false;
      canvas.style.cursor = 'grab';

      if (!state.isTorn && state.dragDist > 0 && state.dragDist < 80 * state.dpr) {
        snapBack(ctx, canvas, state, noiseData);
      }
    }

    // Mouse
    canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handlePointerDown(e.clientX, e.clientY);
    });

    const onMouseMove = (e) => handlePointerMove(e.clientX, e.clientY);
    const onMouseUp = () => handlePointerUp();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      handlePointerDown(touch.clientX, touch.clientY);
    }, { passive: false });

    const onTouchMove = (e) => {
      if (!state.isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      handlePointerMove(touch.clientX, touch.clientY);
    };
    const onTouchEnd = () => handlePointerUp();

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    function cleanup() {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    }

    // Resize handling
    const resizeObserver = new ResizeObserver(() => {
      if (state.isTorn) {
        resizeObserver.disconnect();
        return;
      }
      const newRect = card.getBoundingClientRect();
      canvas.width = Math.round(newRect.width * dpr);
      canvas.height = Math.round(newRect.height * dpr);
      canvas.style.width = newRect.width + 'px';
      canvas.style.height = newRect.height + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      drawMembrane(ctx, canvas.width, canvas.height, state, noiseData);
    });
    resizeObserver.observe(card);

  } catch (err) {
    console.error('[RubberTear] setupMembrane failed for card, leaving it visible:', err);
  }
}

/* ═══════════════════════════════════════════════════════
   Public API
   ═══════════════════════════════════════════════════════ */

export function initRubberTear() {
  try {
    const cards = document.querySelectorAll('.projects-grid .crt-card:not(.pixel-card)');
    if (!cards.length) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    cards.forEach((card) => setupMembrane(card));
  } catch (err) {
    console.error('[RubberTear] Init failed, cards unchanged:', err);
  }
}
