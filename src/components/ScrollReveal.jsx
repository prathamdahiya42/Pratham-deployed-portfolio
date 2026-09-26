import { motion, useReducedMotion } from 'framer-motion';

export default function ScrollReveal({ children, direction = 'up', delay = 0, className = '' }) {
  const reduced = useReducedMotion();

  const offsets = {
    up:    { y: 50 },
    down:  { y: -50 },
    left:  { x: -50 },
    right: { x: 50 },
  };

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...offsets[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
      viewport={{ once: true, margin: '-80px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
