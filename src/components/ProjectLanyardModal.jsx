import { useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Lanyard from './Lanyard';
import { getProjectLanyardVisuals } from '../utils/lanyardBadges';

export default function ProjectLanyardModal({ project, onClose, themeMode = 'Dim' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!project) return null;

  const visuals = getProjectLanyardVisuals(project);
  const isDim = themeMode === 'Dim';
  const textColor = isDim ? '#FFFFFF' : '#0F172A';
  const textSecondary = isDim ? '#A1A1AA' : '#475569';
  const textMuted = isDim ? '#71717A' : '#94A3B8';
  const borderSubtle = isDim ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1rem, 3vw, 2rem)',
        background: isDim ? 'rgba(0, 0, 0, 0.75)' : 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: 920,
          height: 'min(90vh, 760px)',
          background: isDim ? 'rgba(12, 10, 18, 0.94)' : 'rgba(255, 255, 255, 0.92)',
          border: isDim ? '1px solid rgba(167, 139, 250, 0.25)' : '1px solid rgba(234, 88, 12, 0.2)',
          borderRadius: 20,
          boxShadow: isDim
            ? '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(167, 139, 250, 0.15)'
            : '0 25px 60px rgba(0, 0, 0, 0.2), 0 0 30px rgba(234, 88, 12, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* ── Modal Header Bar ── */}
        <div
          style={{
            padding: '1.1rem 1.6rem',
            borderBottom: isDim ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isDim ? 'rgba(255, 255, 255, 0.02)' : 'rgba(234, 88, 12, 0.03)',
            zIndex: 10,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '2px 8px',
                  borderRadius: 100,
                  background: 'rgba(234, 88, 12, 0.14)',
                  color: 'var(--accent-primary)',
                  border: '1px solid rgba(234, 88, 12, 0.3)',
                }}
              >
                {project.category}
              </span>
              <span style={{ fontSize: '0.75rem', color: textMuted }}>
                3D Physics Lanyard Pass
              </span>
            </div>
            <h3
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '1.3rem',
                fontWeight: 800,
                color: textColor,
                margin: 0,
              }}
            >
              {project.name}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close 3D preview"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: isDim ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              border: `1px solid ${borderSubtle}`,
              color: textColor,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-primary)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDim ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.color = textColor;
            }}
          >
            ✕
          </button>
        </div>

        {/* ── 3D Lanyard Canvas Area ── */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Interaction Instruction Pill */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              pointerEvents: 'none',
              background: isDim ? 'rgba(10, 8, 16, 0.75)' : 'rgba(255, 255, 255, 0.85)',
              border: '1px solid var(--border-subtle)',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: 100,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.74rem',
              color: 'var(--text-secondary)',
              fontWeight: 500,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', display: 'inline-block' }} />
            Click &amp; drag to rotate 360° · Inspect Front &amp; Back
          </div>

          <Suspense
            fallback={
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 14,
                  color: 'var(--text-secondary)',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    border: '3px solid rgba(234, 88, 12, 0.2)',
                    borderTop: '3px solid var(--accent-primary)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <span style={{ fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.04em' }}>
                  Loading 3D Canvas...
                </span>
              </div>
            }
          >
            <Lanyard
              position={[0, 0, 14]}
              fov={26}
              transparent={true}
              frontImage={visuals.frontImage}
              backImage={visuals.backImage}
              imageFit="cover"
            />
          </Suspense>
        </div>

        {/* ── Modal Footer Bar ── */}
        <div
          style={{
            padding: '1rem 1.6rem',
            borderTop: isDim ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isDim ? 'rgba(255, 255, 255, 0.02)' : 'rgba(234, 88, 12, 0.03)',
            flexWrap: 'wrap',
            gap: 12,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(project.tech || []).map((t) => (
              <span
                key={t}
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 8px',
                  borderRadius: 4,
                  background: isDim ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                  border: `1px solid ${borderSubtle}`,
                  color: textSecondary,
                  fontFamily: 'monospace',
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener"
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  background: 'var(--accent-primary)',
                  border: '1px solid var(--accent-primary)',
                  padding: '0.45rem 1rem',
                  borderRadius: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                Live Demo ↗
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener"
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  color: textColor,
                  background: isDim ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                  border: `1px solid ${borderSubtle}`,
                  padding: '0.45rem 1rem',
                  borderRadius: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                View Code ↗
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
