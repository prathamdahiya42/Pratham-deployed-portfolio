import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Lenis from '@studio-freight/lenis';
import CustomCursor from './components/CustomCursor';
import ScrollReveal from './components/ScrollReveal';
import TiltCard from './components/TiltCard';
import SectionDivider from './components/SectionDivider';
import StarField from './components/StarField';
import DualImageReveal from './components/DualImageReveal';
import './animations/crtReveal.css';
import { initRubberTear } from './animations/rubberTear';
import './animations/rubberTear.css';

/* ═══════════════════════════════════════════════════════
   Lenis Smooth Scroll Hook
   ═══════════════════════════════════════════════════════ */
function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);
}

/* ═══════════════════════════════════════════════════════
   Stat Counter (animated count-up on scroll)
   ═══════════════════════════════════════════════════════ */
function StatCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          const duration = 2000;
          const startTime = performance.now();
          function update() {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(update);
          }
          requestAnimationFrame(update);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref} aria-live="polite">{count}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════
   Skill Badge (Effect 7)
   ═══════════════════════════════════════════════════════ */
function SkillBadge({ name, icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.08, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '8px 16px',
        borderRadius: 8,
        background: 'rgba(234,88,12,0.07)',
        border: '1px solid rgba(234,88,12,0.2)',
        color: '#1A1A1A',
        fontSize: '0.875rem',
        fontWeight: 500,
        cursor: 'default',
      }}
    >
      {icon && <span style={{ fontSize: '1.1rem' }}>{icon}</span>}
      {name}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   Data
   ═══════════════════════════════════════════════════════ */
const projects = [
  { id: 1, name: 'JEE Focus Complication', badge: 'Live', desc: 'A watchOS complication focused on productivity and deep focus — shipped live to users.', tags: 'Platform: watchOS / Apple Watch', link: '#', linkText: 'View Project →', external: false },
  { id: 2, name: 'Professional Athlete Portfolio', badge: 'GitHub', desc: "A cinematic, scroll-animated personal portfolio built with Vite, GSAP, Lenis, and Three.js — the site you're on right now.", tags: 'Tech: Vite, JavaScript, GSAP, Three.js, Lenis', link: 'https://github.com/prathamdahiya42/Professional-athlete-portfolio', linkText: 'View on GitHub →', external: true },
  { id: 3, name: 'Prep Nexus', badge: 'GitHub', desc: 'An EdTech platform designed to help competitive exam aspirants organize their preparation with smart tools and resources.', tags: 'Tech: Full-Stack Web', link: 'https://github.com/prathamdahiya42/Prep-Nexus', linkText: 'View on GitHub →', external: true },
  { id: 4, name: 'Puzzle Hunt', badge: 'GitHub', desc: 'An interactive puzzle hunt game — solving challenges through code and creative problem-solving.', tags: 'Tech: JavaScript, Web', link: 'https://github.com/prathamdahiya42/Puzzle-hand', linkText: 'View on GitHub →', external: true },
  { id: 5, name: 'Web Tacker', badge: 'GitHub', desc: 'A web-based hacking simulation / educational tool exploring cybersecurity concepts interactively.', tags: 'Tech: JavaScript, Web', link: 'https://github.com/prathamdahiya42', linkText: 'View on GitHub →', external: true },
  { id: 6, name: 'Mini Browser Game', badge: 'GitHub', desc: 'A small, fun browser-based game built as a creative coding exercise — fully playable in the browser.', tags: 'Tech: JavaScript, HTML Canvas', link: 'https://github.com/prathamdahiya42/simple-game', linkText: 'View on GitHub →', external: true },
  { id: 7, name: 'This Portfolio', badge: 'Live', desc: "The very site you're browsing — cinematic scroll animations, Three.js particles, GSAP timelines, and zero frameworks beyond Vite.", tags: 'Tech: Vite, GSAP, Three.js, Lenis, Vanilla JS', link: 'https://github.com/prathamdahiya42', linkText: 'View on GitHub →', external: true },
  {
    id: 8,
    name: 'MPDET WebApp',
    badge: 'Live',
    desc: 'A modern full-stack web application built for real-world deployment — clean UI, fast performance, and scalable architecture. Edit this description to reflect your project specifics.',
    tags: 'Tech: React, Vite, Full-Stack Web',
    links: [
      { href: 'https://mpdet-webapp.vercel.app/', text: 'Live Demo →', label: 'Live demo of MPDET WebApp' },
      { href: 'https://github.com/prathamdahiya42/MPDET-Webapp', text: 'Source Code →', label: 'View MPDET WebApp source code on GitHub' },
    ],
  },
];

const skills = [
  'Python', 'JavaScript / TypeScript', 'React', 'Claude API & LLM Integration',
  'Prompt Engineering', 'Full-Stack Development', 'After Effects', 'CapCut',
  'Claude & Claude Code', 'Gemini & Google AI', 'Base44 / Emergent / Antigravity',
  'ChatGPT & Perplexity', 'ElevenLabs', 'Video Editing & Content Production',
];

const navLinks = [
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#content', label: 'Content' },
  { href: '#contact', label: 'Contact' },
];

/* ═══════════════════════════════════════════════════════
   App
   ═══════════════════════════════════════════════════════ */
export default function App() {
  useSmoothScroll();
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [navOpen, setNavOpen] = useState(false);

  /* Rubber membrane tear reveal — additive overlay on project cards */
  useEffect(() => {
    const id = setTimeout(() => initRubberTear(), 150);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      sections.forEach((section) => {
        const top = section.offsetTop - 200;
        if (window.scrollY >= top) {
          current = '#' + section.id;
        }
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* ── Noise Texture Overlay ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.035,
        }}
      />

      {/* ── Custom Cursor ── */}
      <CustomCursor />

      {/* ══════════════════════════════════════════════════
          Navigation (Effect 9 — Glassmorphism + Active Underline)
          ══════════════════════════════════════════════════ */}
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          padding: scrolled ? '12px 32px' : '20px 32px',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          background: scrolled ? 'rgba(250, 250, 250, 0.88)' : 'transparent',
          borderBottom: scrolled ? '1px solid rgba(234,88,12,0.12)' : '1px solid transparent',
          transition: 'all 0.4s ease',
        }}
        aria-label="Main navigation"
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="#hero" style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', transition: 'color 0.3s' }}>
            Pratham Dahiya
          </a>

          {/* Mobile toggle */}
          <button
            className="nav-toggle"
            onClick={() => setNavOpen(!navOpen)}
            style={{ display: 'none', flexDirection: 'column', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 4, zIndex: 1001 }}
            aria-label="Toggle navigation menu"
            aria-expanded={navOpen}
          >
            <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text-primary)', borderRadius: 2, transition: 'all 0.3s', transform: navOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
            <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text-primary)', borderRadius: 2, transition: 'all 0.3s', opacity: navOpen ? 0 : 1 }} />
            <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text-primary)', borderRadius: 2, transition: 'all 0.3s', transform: navOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
          </button>

          <ul className={`nav-links${navOpen ? ' open' : ''}`} style={{ display: 'flex', gap: '2rem', listStyle: 'none' }} role="list">
            {navLinks.map((link) => (
              <li key={link.href} style={{ position: 'relative' }}>
                <a
                  href={link.href}
                  onClick={() => setNavOpen(false)}
                  style={{
                    fontSize: '0.85rem', fontWeight: 400,
                    color: activeSection === link.href ? 'var(--text-primary)' : 'var(--text-secondary)',
                    transition: 'color 0.3s ease',
                  }}
                >
                  {link.label}
                </a>
                {activeSection === link.href && (
                  <motion.span
                    layoutId="nav-underline"
                    style={{
                      position: 'absolute', bottom: -4, left: 0, right: 0,
                      height: 2,
                      background: 'linear-gradient(90deg, #EA580C, #FB923C)',
                      borderRadius: 1,
                    }}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main>
        {/* ══════════════════════════════════════════════════
            1. Hero Section (Effect 3 — All Layers)
            ══════════════════════════════════════════════════ */}
        <section id="hero" aria-label="Introduction" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

          {/* Layer 1 — Warm white gradient background */}
          <div style={{ background: 'linear-gradient(160deg, #FFF8F4 0%, #FDF4EE 40%, #FFF9F5 100%)', position: 'absolute', inset: 0 }} />

          {/* Layer 2 — Animated gradient orbs (CSS only) */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '10%', left: '5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,88,12,0.12) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'orb-drift 12s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', top: '30%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,146,60,0.10) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'orb-drift 16s ease-in-out infinite reverse' }} />
            <div style={{ position: 'absolute', bottom: '5%', left: '40%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', filter: 'blur(70px)', animation: 'orb-drift 20s ease-in-out infinite', animationDelay: '-5s' }} />
          </div>

          {/* Layer 3 — WebGL StarField (200 twinkling points) */}
          <StarField />

          {/* Overlay vignette */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'radial-gradient(ellipse at center, transparent 0%, rgba(255,245,235,0.6) 80%)', pointerEvents: 'none' }} />

          {/* Layer 4 — Hero content: text (left) + dual-image reveal (right) */}
          <div
            className="hero-inner"
            style={{
              position: 'relative', zIndex: 3,
              width: '100%', maxWidth: 1100,
              padding: '2rem clamp(1.25rem, 4vw, 3rem)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(2.5rem, 5vw, 5rem)',
            }}
          >
            {/* ── Text column ── */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Layer 5 — Glitch name effect */}
              <motion.h1
                className="glitch-text" data-text="Pratham Dahiya"
                {...(reduced ? {} : { initial: { opacity: 0, y: 60 }, animate: { opacity: 1, y: 0 } })}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(2.8rem, 6vw, 6rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.1 }}
              >
                Pratham Dahiya
              </motion.h1>

              <motion.h2
                {...(reduced ? {} : { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } })}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.25rem, 3vw, 2rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', lineHeight: 1.2 }}
              >
                Building AI&nbsp;Tools.<br />Shipping Real&nbsp;Products.
              </motion.h2>

              <motion.p
                {...(reduced ? {} : { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } })}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', color: 'var(--text-secondary)', maxWidth: 480, marginBottom: '2.5rem', lineHeight: 1.65 }}
              >
                Self-taught full-stack developer turning AI experiments into working applications.
              </motion.p>

              <motion.div
                className="hero-ctas"
                {...(reduced ? {} : { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } })}
                transition={{ duration: 0.8, delay: 0.3 }}
                style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
              >
                <a href="#projects" id="cta-projects" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem 1.8rem', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.02em', borderRadius: 6, background: 'var(--accent-primary)', color: '#fff', border: '1px solid var(--accent-primary)', transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>View Projects</a>
                <a href="#content" id="cta-showreel" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem 1.8rem', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.02em', borderRadius: 6, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', color: 'var(--text-primary)', border: '1px solid rgba(234,88,12,0.25)', transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>Watch Showreel</a>
                <a href="#contact" id="cta-contact" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem 1.8rem', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.02em', borderRadius: 6, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', color: 'var(--text-primary)', border: '1px solid rgba(234,88,12,0.25)', transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>Contact Me</a>
              </motion.div>
            </div>

            {/* ── Image column ── */}
            <motion.div
              {...(reduced ? {} : { initial: { opacity: 0, x: 60, scale: 0.95 }, animate: { opacity: 1, x: 0, scale: 1 } })}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
              style={{ flexShrink: 0 }}
            >
              <DualImageReveal />
            </motion.div>
          </div>

          {/* Layer 6 — Bouncing scroll indicator */}
          <motion.div
            {...(reduced ? {} : { animate: { y: [0, 10, 0] } })}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}
          >
            <svg width="24" height="40" viewBox="0 0 24 40" fill="none">
              <rect x="1" y="1" width="22" height="38" rx="11" stroke="rgba(234,88,12,0.45)" strokeWidth="1.5" />
              <motion.rect
                x="10" y="8" width="4" height="8" rx="2"
                fill="#EA580C"
                {...(reduced ? {} : { animate: { y: [0, 12, 0], opacity: [1, 0.3, 1] } })}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </svg>
          </motion.div>
        </section>

        <SectionDivider />

        {/* ══════════════════════════════════════════════════
            2. About Section
            ══════════════════════════════════════════════════ */}
        <section id="about" aria-label="About me" style={{ padding: 'clamp(5rem, 12vh, 10rem) 0', background: 'var(--bg-primary)', position: 'relative' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1.25rem, 4vw, 3rem)' }}>
            <ScrollReveal direction="up">
              <span style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-primary)', marginBottom: '1rem' }}>About</span>
            </ScrollReveal>
            <div style={{ maxWidth: 720 }}>
              <ScrollReveal direction="left">
                <p style={{ fontSize: 'clamp(1.05rem, 2vw, 1.2rem)', lineHeight: 1.8, color: 'var(--text-primary)', marginBottom: '2rem' }}>
                  I'm a developer and content creator based in India, building AI-powered tools and full-stack web applications. After a JEE dropper year, I shifted my focus toward AI and software development — and for the last 2+ years I've been deep in building, breaking, and shipping real products across EdTech, productivity, and developer tooling. I document every step of this journey publicly so others can learn along with me.
                </p>
              </ScrollReveal>
              <ScrollReveal direction="right" delay={0.1}>
                <p style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1rem)', lineHeight: 1.85, color: 'var(--text-secondary)' }}>
                  My journey started early — back in 11th grade, I ran my own small page to gain hands-on experience in marketing and content creation. That foundation carried into a focused JEE prep year, then a full pivot into AI and software development. Since then I've built real products, integrated LLMs like Claude and Gemini into working applications, and documented the entire process for my audience on YouTube. On the creative side, I'm an editor who has cut 200+ proper videos (not counting memes) — around 15–20 of which are currently live on Instagram and YouTube. I work in After Effects and CapCut, and I care about craft whether I'm writing code or cutting a timeline.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ══════════════════════════════════════════════════
            3. Stat Callouts
            ══════════════════════════════════════════════════ */}
        <section id="stats" aria-label="Key statistics" style={{ padding: 'clamp(5rem, 12vh, 10rem) 0', background: 'var(--bg-secondary)', position: 'relative' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1.25rem, 4vw, 3rem)' }}>
            <ScrollReveal direction="up">
              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
                {[
                  { target: 8, suffix: '+', label: 'Projects Built / In Progress' },
                  { target: 2, suffix: '+', label: 'Years of Experience in AI & Deployment' },
                  { target: 2000, suffix: '+', label: 'YouTube Subscribers' },
                  { target: 1, suffix: '', label: 'LLM Integrated (Claude & Gemini Server)' },
                ].map((stat, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <span style={{ display: 'block', fontFamily: "'Sora', sans-serif", fontSize: 'clamp(3.5rem, 7vw, 4.5rem)', color: 'var(--accent-primary)', marginBottom: '0.75rem', lineHeight: 1 }}>
                      <StatCounter target={stat.target} suffix={stat.suffix} />
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: 200, margin: '0 auto', display: 'block' }}>{stat.label}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <SectionDivider />

        {/* ══════════════════════════════════════════════════
            4. Skills / Tech Stack (Effect 7)
            ══════════════════════════════════════════════════ */}
        <section id="skills" aria-label="Skills and technologies" style={{ padding: 'clamp(5rem, 12vh, 10rem) 0', background: 'var(--bg-primary)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1.25rem, 4vw, 3rem)' }}>
            <ScrollReveal direction="up">
              <span style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-primary)', marginBottom: '1rem' }}>Tech Stack</span>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2.5rem' }}>Skills &amp; Technologies</h2>
            </ScrollReveal>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {skills.map((skill, i) => (
                <ScrollReveal key={skill} direction="up" delay={i * 0.05}>
                  <SkillBadge name={skill} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ══════════════════════════════════════════════════
            5. Project Showcase (Effects 4 + 5)
            ══════════════════════════════════════════════════ */}
        <section id="projects" aria-label="Projects" style={{ padding: 'clamp(5rem, 12vh, 10rem) 0', background: 'var(--bg-secondary)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1.25rem, 4vw, 3rem)' }}>
            <ScrollReveal direction="up">
              <span style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-primary)', marginBottom: '1rem' }}>Work</span>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3rem' }}>Projects</h2>
            </ScrollReveal>
            <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {projects.map((p) => (
                <div key={p.id} className="crt-card">
                  <TiltCard>
                    <div className="crt-card-content" style={{ padding: '2rem', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem' }}>
                        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</h3>
                        <span style={{ fontSize: '0.7rem', fontWeight: 500, padding: '0.3rem 0.75rem', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', flexShrink: 0, background: 'rgba(234, 88, 12, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(234, 88, 12, 0.25)' }}>{p.badge}</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '1.25rem', flex: 1 }}>{p.desc}</p>
                      <div style={{ marginBottom: '1.25rem' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent-glow)', letterSpacing: '0.01em' }}>{p.tags}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', flexWrap: 'wrap' }}>
                        {p.links
                          ? p.links.map((l, i) => (
                            <a
                              key={i}
                              href={l.href}
                              target="_blank"
                              rel="noopener"
                              aria-label={l.label}
                              style={{
                                fontSize: '0.8rem', fontWeight: 500,
                                color: i === 0 ? '#fff' : 'var(--accent-primary)',
                                background: i === 0 ? 'var(--accent-primary)' : 'transparent',
                                border: i === 0 ? '1px solid var(--accent-primary)' : '1px solid rgba(234,88,12,0.3)',
                                padding: '0.4rem 0.9rem',
                                borderRadius: 6,
                                transition: 'all 0.25s ease',
                                display: 'inline-flex', alignItems: 'center',
                              }}
                            >
                              {l.text}
                            </a>
                          ))
                          : (
                            <a
                              href={p.link}
                              style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--accent-primary)', transition: 'color 0.3s ease' }}
                              {...(p.external ? { target: '_blank', rel: 'noopener' } : {})}
                              aria-label={`${p.linkText} ${p.name}`}
                            >
                              {p.linkText}
                            </a>
                          )
                        }
                      </div>
                    </div>
                  </TiltCard>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ══════════════════════════════════════════════════
            6. Content & Creation
            ══════════════════════════════════════════════════ */}
        <section id="content" aria-label="Content and creation" style={{ padding: 'clamp(5rem, 12vh, 10rem) 0', background: 'var(--bg-primary)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1.25rem, 4vw, 3rem)' }}>
            <ScrollReveal direction="up">
              <span style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-primary)', marginBottom: '1rem' }}>Media</span>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3rem' }}>Content &amp; Creation</h2>
            </ScrollReveal>

            {/* Showreel Embed */}
            <ScrollReveal direction="up" delay={0.1}>
              <div id="showreel" style={{ aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(234,88,12,0.15)', marginBottom: '3rem', background: 'rgba(255,255,255,0.55)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/B1ecCp3f2rU"
                  title="YouTube video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ border: 'none' }}
                ></iframe>
              </div>
            </ScrollReveal>

            {/* YouTube Channel Callout */}
            <ScrollReveal direction="up" delay={0.15}>
              <div className="yt-callout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', padding: '2rem 2.5rem', border: '1px solid rgba(234,88,12,0.15)', borderRadius: 10, background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', marginBottom: '3rem', flexWrap: 'wrap', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <div>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>YouTube — Know Your Tech</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>2,000+ subscribers · AI tools, dev builds &amp; real-world tutorials</p>
                </div>
                <a href="https://youtube.com/@hey.prathamdahiya?si=lLfKA1n_icF0WDHe" target="_blank" rel="noopener" aria-label="Visit YouTube channel" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem 1.8rem', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 500, borderRadius: 6, background: 'var(--accent-primary)', color: '#fff', border: '1px solid var(--accent-primary)', transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>Visit Channel →</a>
              </div>
            </ScrollReveal>

            {/* Video Thumbnails */}
            <ScrollReveal direction="up" delay={0.2}>
              <div className="video-thumbs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                {['Building an AI App from Scratch', 'Claude API Deep Dive', 'My Dev Setup & Workflow'].map((title, i) => (
                  <a key={i} href="#" aria-label={`Video thumbnail ${i + 1}`} style={{ display: 'block', transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    <div role="img" aria-label="Video thumbnail placeholder" style={{ aspectRatio: '16/9', borderRadius: 8, background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)', border: '1px solid rgba(234,88,12,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '0.75rem', transition: 'border-color 0.3s ease', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.35 }}>
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{title}</span>
                  </a>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <SectionDivider />

        {/* ══════════════════════════════════════════════════
            7. Contact / Closing CTA (Effect 8)
            ══════════════════════════════════════════════════ */}
        <section id="contact" aria-label="Contact" style={{ padding: 'clamp(5rem, 12vh, 10rem) 0', textAlign: 'center', background: 'var(--bg-secondary)', position: 'relative' }}>
          {/* Grid + glow background */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(234,88,12,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(234,88,12,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse at 50% 100%, rgba(234,88,12,0.10), transparent 70%)', filter: 'blur(40px)' }} />
          </div>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1.25rem, 4vw, 3rem)', position: 'relative', zIndex: 2 }}>
            <ScrollReveal direction="up">
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', fontWeight: 700, color: 'var(--text-primary)', maxWidth: 700, margin: '0 auto 3rem', lineHeight: 1.35 }}>Open to collaborations, freelance work, and interesting problems — let's build something.</h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.1}>
              <div className="contact-links" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <a href="mailto:prathamdahiya90@gmail.com" id="contact-email" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', transition: 'color 0.3s ease, transform 0.3s ease', padding: '0.5rem 0' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,7 12,13 2,7" /></svg>
                  Email
                </a>
                <a href="https://github.com/prathamdahiya42" target="_blank" rel="noopener" id="contact-github" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', transition: 'color 0.3s ease, transform 0.3s ease', padding: '0.5rem 0' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
                  GitHub
                </a>
                <a href="https://youtube.com/@hey.prathamdahiya?si=lLfKA1n_icF0WDHe" target="_blank" rel="noopener" id="contact-youtube" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', transition: 'color 0.3s ease, transform 0.3s ease', padding: '0.5rem 0' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2 29 29 0 0 0-.46 5.25 29 29 0 0 0 .46 5.25 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.25z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
                  YouTube
                </a>
                <a href="https://www.instagram.com/hey.idroid/" target="_blank" rel="noopener" id="contact-instagram" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', transition: 'color 0.3s ease, transform 0.3s ease', padding: '0.5rem 0' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                  Instagram
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════════
          Footer
          ══════════════════════════════════════════════════ */}
      <footer style={{ padding: '2rem 0', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1.25rem, 4vw, 3rem)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.03em' }}>&copy; 2026 · Built with intention.</p>
        </div>
      </footer>
    </>
  );
}
