export default function SectionDivider() {
  return (
    <div style={{ position: 'relative', height: 2, margin: '0 auto', maxWidth: 800, overflow: 'visible' }}>
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, var(--accent-primary, #EA580C), var(--accent-glow, #FB923C), transparent)',
        opacity: 0.45,
      }} />
      <div
        className="section-divider-dot"
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--accent-primary, #EA580C)',
          boxShadow: '0 0 12px 4px var(--accent-glow, rgba(234,88,12,0.5))',
        }}
      />
    </div>
  );
}
