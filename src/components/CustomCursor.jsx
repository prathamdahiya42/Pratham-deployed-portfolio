import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef   = useRef(null);
  const ringRef  = useRef(null);
  const pos      = useRef({ x: 0, y: 0 });
  const ringPos  = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Only run on hover-capable devices
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const moveCursor = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', moveCursor);

    // Magnetic hover: all links and buttons get a pull effect
    const interactables = document.querySelectorAll('a, button, [data-cursor-magnetic]');
    const handleEnter = () => ringRef.current?.classList.add('cursor-hover');
    const handleLeave = () => ringRef.current?.classList.remove('cursor-hover');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', handleEnter);
      el.addEventListener('mouseleave', handleLeave);
    });

    // Smooth lagging ring
    let raf;
    const animate = () => {
      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`;
      }
      if (ringRef.current) {
        ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.12;
        ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.12;
        ringRef.current.style.transform =
          `translate(${ringPos.current.x - 20}px, ${ringPos.current.y - 20}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      cancelAnimationFrame(raf);
      interactables.forEach(el => {
        el.removeEventListener('mouseenter', handleEnter);
        el.removeEventListener('mouseleave', handleLeave);
      });
    };
  }, []);

  return (
    <>
      {/* Inner dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 8, height: 8,
          background: '#EA580C',
          borderRadius: '50%',
          zIndex: 99999,
          pointerEvents: 'none',
          transition: 'background 0.2s',
        }}
      />

      {/* Outer lagging ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 40, height: 40,
          border: '1.5px solid rgba(234, 88, 12, 0.6)',
          borderRadius: '50%',
          zIndex: 99998,
          pointerEvents: 'none',
          transition: 'width 0.3s, height 0.3s, border-color 0.3s',
        }}
        className="cursor-ring"
      />
    </>
  );
}
