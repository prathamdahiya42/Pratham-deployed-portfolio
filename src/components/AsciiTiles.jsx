import { useEffect, useRef } from 'react';

/**
 * AsciiTiles — React Bits Pro style glassy ASCII tile background
 *
 * Renders a responsive field of glassy tiles composed of glowing ASCII characters.
 *
 * Two Named States:
 * - "Dim": pure black base (#000000), crisp silver ASCII characters with warm electric amber glow.
 * - "Daylight": pure white base (#FFFFFF), crisp slate ASCII characters with subtle amber glow.
 *
 * Features:
 * - Mouse cursor tracking with glassy refraction, tilt, and chromatic spread.
 * - Gentle ambient idle wave across tile grid.
 * - Respects prefers-reduced-motion with static fallback.
 * - Strict viewport clipping to never overlap the hero section.
 */
const GLYPH_CHARS = [
  '{', '}', '[', ']', '<', '>', '/', '\\', '+', '=', '*', '#', ':', '.', '~', '^',
  '%', '$', '&', '_', '|', ';', '?', '!', '0', '1', '7', 'X', 'O', '◊', '∆', '⁝'
];

export default function AsciiTiles({
  mode = 'Dim', // 'Dim' | 'Daylight'
  tileSize = 56,
  glyphSize = 13,
  tileDensity = 1.0,
  tileShear = 0.04,
  refractionStrength = 0.15,
  chromaticSpread = 2.0,
  glyphColor,
  recessColor,
  glowIntensity,
  className = '',
  style = {},
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });
  const scrollRef = useRef(0);

  const isDim = mode.toLowerCase() === 'dim';

  // Palette configuration for Dim (Pure Black) vs Daylight (Pure White)
  const palette = isDim
    ? {
        baseBg: '#000000',
        recess: recessColor || 'rgba(12, 12, 12, 0.90)',
        tileBorder: 'rgba(255, 255, 255, 0.08)',
        tileBevelLight: 'rgba(255, 255, 255, 0.16)',
        tileBevelDark: 'rgba(0, 0, 0, 0.95)',
        glyph: glyphColor || '#E4E4E7',
        glyphGlow: 'rgba(255, 107, 0, 0.70)',
        ambientGlyph: 'rgba(255, 255, 255, 0.14)',
        pointerGlow: 'rgba(255, 107, 0, 0.32)',
        pointerGlowInner: 'rgba(255, 215, 160, 0.50)',
        chromaR: 'rgba(255, 107, 0, 0.60)',
        chromaB: 'rgba(56, 189, 248, 0.50)',
        glowMult: glowIntensity !== undefined ? glowIntensity : 0.85,
      }
    : {
        baseBg: '#FFFFFF',
        recess: recessColor || 'rgba(245, 245, 247, 0.85)',
        tileBorder: 'rgba(0, 0, 0, 0.06)',
        tileBevelLight: 'rgba(255, 255, 255, 0.95)',
        tileBevelDark: 'rgba(0, 0, 0, 0.08)',
        glyph: glyphColor || '#64748B',
        glyphGlow: 'rgba(234, 88, 12, 0.35)',
        ambientGlyph: 'rgba(100, 116, 139, 0.25)',
        pointerGlow: 'rgba(234, 88, 12, 0.15)',
        pointerGlowInner: 'rgba(255, 237, 213, 0.35)',
        chromaR: 'rgba(234, 88, 12, 0.25)',
        chromaB: 'rgba(14, 165, 233, 0.25)',
        glowMult: glowIntensity !== undefined ? glowIntensity : 0.40,
      };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let animId;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize);

    // Track pointer
    function onPointerMove(e) {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    }
    function onPointerLeave() {
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
    }
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('mouseleave', onPointerLeave);

    // Track scroll
    function onScroll() {
      scrollRef.current = window.scrollY || window.pageYOffset;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Generate static glyph assignments per grid coordinate for stable aesthetics
    const glyphMap = new Map();
    function getTileGlyph(col, row) {
      const key = `${col}_${row}`;
      if (!glyphMap.has(key)) {
        // Pseudo-random deterministic hash
        const h = Math.abs(Math.sin(col * 12.9898 + row * 78.233) * 43758.5453);
        const idx = Math.floor((h - Math.floor(h)) * GLYPH_CHARS.length);
        glyphMap.set(key, GLYPH_CHARS[idx]);
      }
      return glyphMap.get(key);
    }

    const startTime = performance.now();

    function render(now) {
      // Container bounds relative to viewport
      const rect = container.getBoundingClientRect();

      // If container is not visible at all in viewport, pause painting
      if (rect.bottom <= 0 || rect.top >= height) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Clip canvas strictly to container's visible top to guarantee ZERO overlap with hero
      const clipTop = Math.max(0, rect.top);
      const clipBottom = Math.max(0, height - rect.bottom);
      canvas.style.clipPath = `inset(${clipTop}px 0px ${clipBottom}px 0px)`;

      // Smooth pointer lerp
      const lerp = 0.085;
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * lerp;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * lerp;

      const elapsed = prefersReducedMotion ? 0 : (now - startTime) / 1000;

      // Clear viewport
      ctx.clearRect(0, 0, width, height);

      // Draw background tint
      ctx.fillStyle = palette.baseBg;
      ctx.fillRect(0, 0, width, height);

      const effectiveSize = Math.max(40, Math.round(tileSize / tileDensity));
      const cols = Math.ceil(width / effectiveSize) + 2;
      const rows = Math.ceil(height / effectiveSize) + 2;

      // Vertical parallax offset based on scroll
      const scrollY = scrollRef.current;
      const scrollOffset = scrollY % effectiveSize;
      const baseRowIndex = Math.floor(scrollY / effectiveSize);

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const maxDist = 280;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `600 ${glyphSize}px 'Fira Code', 'Courier New', monospace`;

      for (let r = -1; r < rows; r++) {
        const gridRow = baseRowIndex + r;
        const y = Math.round(r * effectiveSize - scrollOffset);

        for (let c = -1; c < cols; c++) {
          const gridCol = c;
          const x = Math.round(c * effectiveSize);

          const cx = x + effectiveSize / 2;
          const cy = y + effectiveSize / 2;

          const dx = mouseX - cx;
          const dy = mouseY - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Pointer proximity factor [0, 1]
          const pointerFactor = Math.max(0, 1 - dist / maxDist);
          const easedFactor = Math.pow(pointerFactor, 2.2);

          // Ambient traveling wave
          const wave = prefersReducedMotion
            ? 0.15
            : (Math.sin(c * 0.22 + gridRow * 0.22 + elapsed * 0.85) * 0.5 + 0.5);

          const illum = Math.min(1.0, wave * 0.2 + easedFactor * 0.8);

          // Tile geometry
          const pad = 3;
          const tx = x + pad;
          const ty = y + pad;
          const tw = effectiveSize - pad * 2;
          const th = effectiveSize - pad * 2;
          const radius = 5;

          // Glassy tile 3D shear / tilt toward cursor
          const shearX = easedFactor * dx * tileShear;
          const shearY = easedFactor * dy * tileShear;

          ctx.save();
          ctx.translate(shearX, shearY);

          // Draw recessed cavity
          ctx.beginPath();
          ctx.roundRect(tx, ty, tw, th, radius);
          ctx.fillStyle = palette.recess;
          ctx.fill();

          // Bevel border: highlight top/left, shadow bottom/right
          ctx.lineWidth = 1;
          ctx.strokeStyle = palette.tileBorder;
          ctx.stroke();

          // Glassy top-left specular bevel
          ctx.beginPath();
          ctx.moveTo(tx + radius, ty);
          ctx.lineTo(tx + tw - radius, ty);
          ctx.moveTo(tx, ty + radius);
          ctx.lineTo(tx, ty + th - radius);
          ctx.strokeStyle = palette.tileBevelLight;
          ctx.stroke();

          // Glassy bottom-right shadow bevel
          ctx.beginPath();
          ctx.moveTo(tx + radius, ty + th);
          ctx.lineTo(tx + tw - radius, ty + th);
          ctx.moveTo(tx + tw, ty + radius);
          ctx.lineTo(tx + tw, ty + th - radius);
          ctx.strokeStyle = palette.tileBevelDark;
          ctx.stroke();

          // Cursor glass illumination inside tile
          if (easedFactor > 0.04) {
            const grad = ctx.createRadialGradient(
              cx, cy, 0,
              cx, cy, tw * 0.75
            );
            grad.addColorStop(0, palette.pointerGlowInner);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(tx, ty, tw, th, radius);
            ctx.fill();
          }

          // ASCII Character inside tile
          const glyph = getTileGlyph(gridCol, gridRow);
          const glyphCx = cx;
          const glyphCy = cy;

          // Prismatic chromatic aberration refraction near cursor
          if (easedFactor > 0.1 && chromaticSpread > 0 && !prefersReducedMotion) {
            const spread = chromaticSpread * easedFactor * (refractionStrength * 10);
            ctx.fillStyle = palette.chromaR;
            ctx.fillText(glyph, glyphCx - spread, glyphCy);
            ctx.fillStyle = palette.chromaB;
            ctx.fillText(glyph, glyphCx + spread, glyphCy);
          }

          // Main glowing ASCII character
          if (illum > 0.05) {
            ctx.shadowColor = palette.glyphGlow;
            ctx.shadowBlur = Math.round(10 * illum * palette.glowMult);
            ctx.fillStyle = palette.glyph;
            ctx.globalAlpha = Math.max(0.2, illum);
            ctx.fillText(glyph, glyphCx, glyphCy);
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1.0;
          } else {
            ctx.fillStyle = palette.ambientGlyph;
            ctx.fillText(glyph, glyphCx, glyphCy);
          }

          ctx.restore();
        }
      }

      // Large ambient radial pointer glow across entire tile field
      if (mouseX > 0 && mouseY > 0 && !prefersReducedMotion) {
        const aura = ctx.createRadialGradient(
          mouseX, mouseY, 0,
          mouseX, mouseY, maxDist
        );
        aura.addColorStop(0, palette.pointerGlow);
        aura.addColorStop(1, 'transparent');
        ctx.fillStyle = aura;
        ctx.fillRect(0, 0, width, height);
      }

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, [
    mode,
    tileSize,
    glyphSize,
    tileDensity,
    tileShear,
    refractionStrength,
    chromaticSpread,
    glyphColor,
    recessColor,
    glowIntensity,
  ]);

  return (
    <div
      ref={containerRef}
      className={`ascii-tiles-container ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
        backgroundColor: palette.baseBg,
        transition: 'background-color 0.4s ease',
        ...style,
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'block',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    </div>
  );
}

export { AsciiTiles };
