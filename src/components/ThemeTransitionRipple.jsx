import { motion, AnimatePresence } from 'framer-motion';

/**
 * ThemeTransitionRipple — Radial dawn/twilight ripple effect
 * Expands dynamically from the exact coordinate of the theme toggle button.
 */
export default function ThemeTransitionRipple({ ripple, onComplete, reducedMotion = false }) {
  if (!ripple) return null;

  const isDaylight = ripple.mode === 'Daylight';

  // If user prefers reduced motion, render a subtle soft fade without radial scale
  if (reducedMotion) {
    return (
      <AnimatePresence onExitComplete={onComplete}>
        <motion.div
          key={ripple.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.35, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 99998,
            backgroundColor: isDaylight ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.4)',
          }}
        />
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence onExitComplete={onComplete}>
      <motion.div
        key={ripple.id}
        initial={{
          clipPath: `circle(0px at ${ripple.x}px ${ripple.y}px)`,
          opacity: 0.88,
        }}
        animate={{
          clipPath: `circle(160vmax at ${ripple.x}px ${ripple.y}px)`,
          opacity: [0.88, 0.5, 0],
        }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.72,
          ease: [0.16, 1, 0.3, 1],
        }}
        onAnimationComplete={onComplete}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 99998,
          background: isDaylight
            ? 'radial-gradient(circle at center, rgba(254, 243, 199, 0.65) 0%, rgba(251, 146, 60, 0.28) 32%, rgba(255, 255, 255, 0.85) 65%, transparent 95%)'
            : 'radial-gradient(circle at center, rgba(168, 85, 247, 0.42) 0%, rgba(255, 107, 0, 0.22) 32%, rgba(0, 0, 0, 0.94) 65%, transparent 95%)',
          mixBlendMode: isDaylight ? 'screen' : 'normal',
        }}
      />
    </AnimatePresence>
  );
}
