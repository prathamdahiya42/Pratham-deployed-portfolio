import { useEffect, useRef, useCallback } from 'react';
import realImg from '../assets/real.jpg';
import ghibliImg from '../assets/ghibli.png';

/* ─────────────────────────────────────────────────────────────
   DualImageReveal
   • Bottom layer  : real.jpg           (z-index 0)
   • Middle layer  : ghibli.png         (z-index 1, mix-blend-mode: luminosity at 0.82 opacity — lets real photo subtly bleed through)
   • Top layer     : reveal overlay div (z-index 2) — masked circular window that "burns" through the ghibli layer, exposing an inverted+hue-shifted cinematic window over the real photo
   ───────────────────────────────────────────────────────────── */
export default function DualImageReveal() {
  const containerRef = useRef(null);
  const revealRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const current = useRef({ x: -9999, y: -9999 }); // start offscreen
  const rafId = useRef(null);
  const isHovering = useRef(false);
  const revealOpacity = useRef(0); // 0 → 1 fade on enter

  const RADIUS = 105; // half of 210px diameter
  const LERP = 0.10; // smoothness factor
  const FEATHER = 0.38; // % of radius that is solid white (mask hard core)

  /* ── Smooth cursor loop ── */
  const tick = useCallback(() => {
    rafId.current = requestAnimationFrame(tick);
    const el = revealRef.current;
    if (!el) return;

    // Lerp position
    current.current.x += (mouse.current.x - current.current.x) * LERP;
    current.current.y += (mouse.current.y - current.current.y) * LERP;

    // Fade opacity in/out
    const targetOpacity = isHovering.current ? 1 : 0;
    revealOpacity.current += (targetOpacity - revealOpacity.current) * 0.08;

    const cx = current.current.x;
    const cy = current.current.y;
    const op = revealOpacity.current;

    el.style.opacity = op;
    // Move the masked reveal — centred on cursor relative to container
    el.style.maskImage = `radial-gradient(circle ${RADIUS}px at ${cx}px ${cy}px, white ${(FEATHER * 100).toFixed(0)}%, transparent 100%)`;
    el.style.webkitMaskImage = el.style.maskImage;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    };

    const onEnter = () => { isHovering.current = true; };
    const onLeave = () => { isHovering.current = false; };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);

    rafId.current = requestAnimationFrame(tick);

    return () => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafId.current);
    };
  }, [tick]);

  return (
    <div
      ref={containerRef}
      id="dual-image-reveal"
      aria-label="Portrait — hover to reveal"
      style={{
        position: 'relative',
        width: 'clamp(260px, 30vw, 380px)',
        aspectRatio: '3 / 4',
        borderRadius: 20,
        overflow: 'hidden',
        flexShrink: 0,
        /* Outer glow ring */
        boxShadow: '0 0 0 1px rgba(108,99,255,0.25), 0 0 60px rgba(108,99,255,0.12), 0 32px 80px rgba(0,0,0,0.6)',
        cursor: 'crosshair',
      }}
    >
      {/* ── Layer 0: Real photo (always visible at bottom) ── */}
      <img
        src={realImg}
        alt="Pratham Dahiya — photo"
        draggable={false}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          zIndex: 0,
          userSelect: 'none',
        }}
      />

      {/* ── Layer 1: Ghibli illustration (rests on top, mostly opaque) ── */}
      <img
        src={ghibliImg}
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          zIndex: 1,
          /* Luminosity blend lets a hint of the real skin tones bleed through */
          mixBlendMode: 'normal',
          opacity: 0.92,
          userSelect: 'none',
        }}
      />

      {/* ── Layer 2: Reveal "burn-through" overlay ── */}
      {/*
          This div sits on top of BOTH images and acts as the cinematic reveal window.
          It renders the REAL photo through a masked circle, with:
            • filter: invert(0.15) hue-rotate(40deg) saturate(1.5) — filmic warmth
            • opacity: controlled by JS (fades in on hover)
          The CSS mask creates the feathered circle that follows the cursor.
          Because this layer shows the real photo via a *second* <img> inside it,
          the circular window literally "reveals" the real image beneath the ghibli art.
      */}
      <div
        ref={revealRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          opacity: 0,
          pointerEvents: 'none',
          /* Will be set dynamically by JS */
          maskImage: 'none',
          WebkitMaskImage: 'none',
        }}
      >
        {/* Real photo copy inside the reveal window, with cinematic filter */}
        <img
          src={realImg}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            userSelect: 'none',
            /* Cinematic treatment: slight inversion → film-burn feel, warm hue shift */
            filter: 'invert(0.12) hue-rotate(38deg) saturate(1.55) brightness(1.08)',
          }}
        />

        {/* Soft radial vignette ring at the edge of the circle for depth */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(108,99,255,0.08) 100%)',
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* ── Decorative corner tag ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          zIndex: 3,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '4px 10px',
          borderRadius: 100,
          background: 'rgba(5,8,16,0.65)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(108,99,255,0.25)',
          fontSize: '0.6rem',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(240,240,248,0.55)',
        }}
      >
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#6C63FF', boxShadow: '0 0 6px #6C63FF', display: 'inline-block' }} />
        hover to reveal
      </div>
    </div>
  );
}
