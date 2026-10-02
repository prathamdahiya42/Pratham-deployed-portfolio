import { motion, AnimatePresence } from 'framer-motion';

/**
 * ThemeToggle — Interactive Mode Switcher (Dim vs Daylight)
 * Features:
 * - Animated Sun / Moon SVG icons with smooth rotation and scale
 * - Tactile micro-pop bounce on hover and tap
 * - Smooth animated text morph
 * - Emits click coordinates for radial ripple animation
 */
export default function ThemeToggle({
  themeMode,
  onToggle,
  className = '',
  style = {},
}) {
  const isDim = themeMode === 'Dim';

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const nextMode = isDim ? 'Daylight' : 'Dim';
    if (onToggle) {
      onToggle(nextMode, { x, y });
    }
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={handleClick}
      aria-label={`Current theme is ${themeMode}. Click to switch to ${isDim ? 'Daylight' : 'Dim'}`}
      title={`Switch theme to ${isDim ? 'Daylight' : 'Dim'}`}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '9px',
        padding: '6px 14px',
        borderRadius: 100,
        border: isDim
          ? '1px solid rgba(255, 255, 255, 0.18)'
          : '1px solid rgba(0, 0, 0, 0.12)',
        background: isDim
          ? 'rgba(10, 10, 10, 0.88)'
          : 'rgba(255, 255, 255, 0.92)',
        color: isDim ? '#FFFFFF' : '#0F172A',
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.78rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        cursor: 'pointer',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'background 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
        boxShadow: isDim
          ? '0 0 16px rgba(255, 107, 0, 0.22), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
          : '0 2px 12px rgba(234, 88, 12, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
        zIndex: 1002,
        position: 'relative',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* Animated Icon Container */}
      <span
        style={{
          position: 'relative',
          width: 16,
          height: 16,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {!isDim ? (
            /* Daylight: Animated Golden Sun */
            <motion.svg
              key="sun-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#EA580C"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ rotate: -90, scale: 0.2, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.2, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: 15,
                height: 15,
                filter: 'drop-shadow(0 0 4px rgba(234, 88, 12, 0.5))',
              }}
            >
              <circle cx="12" cy="12" r="4.2" fill="#F59E0B" stroke="#EA580C" strokeWidth="1.8" />
              <line x1="12" y1="1" x2="12" y2="3.5" />
              <line x1="12" y1="20.5" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.99" y2="5.99" />
              <line x1="18.01" y1="18.01" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3.5" y2="12" />
              <line x1="20.5" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.99" y2="18.01" />
              <line x1="18.01" y1="5.99" x2="19.78" y2="4.22" />
            </motion.svg>
          ) : (
            /* Dim: Animated Electric Amber Moon Crescent */
            <motion.svg
              key="moon-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF6B00"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ rotate: 90, scale: 0.2, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.2, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: 14,
                height: 14,
                filter: 'drop-shadow(0 0 5px rgba(255, 107, 0, 0.7))',
              }}
            >
              <path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                fill="rgba(255, 107, 0, 0.35)"
                stroke="#FF6B00"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </span>

      {/* Animated Text Label */}
      <span
        style={{
          position: 'relative',
          display: 'inline-block',
          minWidth: 50,
          textAlign: 'left',
          lineHeight: 1,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={themeMode}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{ display: 'inline-block' }}
          >
            {themeMode}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.button>
  );
}
