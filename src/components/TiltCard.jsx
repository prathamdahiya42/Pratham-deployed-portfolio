import { useRef, useState } from 'react';

export default function TiltCard({ children, className = '' }) {
  const ref  = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  function onMove(e) {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientY - rect.top)  / rect.height - 0.5;
    const y = (e.clientX - rect.left) / rect.width  - 0.5;
    setTilt({ x: x * -12, y: y * 12 });
    setGlowPos({
      x: ((e.clientX - rect.left) / rect.width)  * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
    });
  }

  function onLeave() {
    setTilt({ x: 0, y: 0 });
    setGlowPos({ x: 50, y: 50 });
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02,1.02,1.02)`,
        transition: 'transform 0.15s ease-out',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        background: 'var(--bg-card, rgba(255, 255, 255, 0.55))',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.7))',
        boxShadow: 'var(--glass-shadow, 0 8px 32px rgba(0, 0, 0, 0.08))',
        color: 'var(--text-primary)',
      }}
      className={className}
    >
      {/* Mouse-following inner glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(circle 200px at ${glowPos.x}% ${glowPos.y}%, var(--accent-glow, rgba(234,88,12,0.12)), transparent 70%)`,
          transition: 'background 0.1s',
        }}
      />
      {children}
    </div>
  );
}
