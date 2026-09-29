import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import Lenis from '@studio-freight/lenis';
import CustomCursor from './components/CustomCursor';
import ScrollReveal from './components/ScrollReveal';
import TiltCard from './components/TiltCard';
import SectionDivider from './components/SectionDivider';
import StarField from './components/StarField';
import GlassReveal from './components/GlassReveal';
import AsciiTiles from './components/AsciiTiles';
import TechText from './components/TechText';
import SplitFlapText from './components/SplitFlapText';
import DecryptedText from './components/DecryptedText';
import BlurText from './components/BlurText';
import AgentChat from './components/AgentChat';
import PixelCard from './components/PixelCard';
import './animations/crtReveal.css';
import { initRubberTear } from './animations/rubberTear';
import './animations/rubberTear.css';

const ProjectLanyardModal = lazy(() => import('./components/ProjectLanyardModal'));

/* ═══════════════════════════════════════════════════════
   Lenis Smooth Scroll Hook
   ═══════════════════════════════════════════════════════ */
function useSmoothScroll() {
  useEffect(() => {
    // If opening without a specific anchor hash, always land at the front / hero page
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    if (!window.location.hash) {
      lenis.scrollTo(0, { immediate: true });
    }

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
      { threshold: 0.2 }
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
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-primary)',
        fontSize: '0.875rem',
        fontWeight: 500,
        cursor: 'default',
        transition: 'background 0.3s ease, border-color 0.3s ease, color 0.3s ease',
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
const projectCategories = ['All', 'Client Work', 'Hackathons', 'Personal Builds', 'For Fun'];

const projects = [
  /* ── CLIENT WORK ── */
  {
    id: 1,
    category: 'Client Work',
    name: "Pravin Dahiya's Portfolio",
    tagline: 'Single-page portfolio and coaching hub for a PE teacher & yoga instructor.',
    desc: 'A single-page portfolio engineered for client Pravin Kumar Dahiya (PE teacher and yoga instructor in Satna, MP). Features sticky navigation, an interactive experience timeline, skills matrix, blog, and smooth Intersection Observer scroll reveals. Integrated with Decap CMS so the client can publish blog posts and updates without touching code.',
    tech: ['HTML', 'CSS', 'Vanilla JS', 'Decap CMS', 'Intersection Observer'],
    liveUrl: null,
    repoUrl: 'https://github.com/prathamdahiya42/Pravin-dahiya-s-portfolio',
  },
  {
    id: 2,
    category: 'Client Work',
    name: 'The Skyline Travels World',
    tagline: 'High-converting tour booking platform for a pan-India travel agency.',
    desc: 'A commercial travel booking site built for a Bhopal-based pan-India agency. Features prominent hero Book Now and Call Now CTAs paired with a dedicated Quick Tour Enquiry form. Includes an MP-focused travel gallery and a direct WhatsApp-integrated enquiry workflow to maximize lead conversions.',
    tech: ['React', 'Vite', 'Tailwind CSS', 'WhatsApp Integration'],
    liveUrl: null,
    repoUrl: 'https://github.com/prathamdahiya42/The-Skyline-Travels-World',
  },
  {
    id: 3,
    category: 'Client Work',
    name: 'Crafted by Habiba',
    tagline: 'Serverless e-commerce storefront for handcrafted gifts and custom bracelets.',
    desc: 'An e-commerce website designed for an Instagram handmade accessories brand ("Customized with Love"). Architected without a traditional backend using Decap CMS for product catalogs, customer reviews, and store settings, deployed on Netlify with secure Netlify Identity and Git Gateway auth on /admin.',
    tech: ['React', 'Vite', 'Tailwind v4', 'Motion', 'React Router v7', 'Decap CMS', 'Netlify'],
    liveUrl: null,
    repoUrl: 'https://github.com/prathamdahiya42/Commercial-Business-site',
  },
  {
    id: 4,
    category: 'Client Work',
    name: 'MP Rank Finder (MPDET Webapp)',
    tagline: 'Instant DTE merit rank lookup tool for Madhya Pradesh engineering aspirants.',
    desc: 'A rapid-lookup utility engineered for MP engineering admissions, letting students check their official DTE merit-list rank immediately on release day. Eliminates the bottleneck of crashing official portals with instantaneous client-side querying and responsive feedback. Shipped same-day to serve hundreds of students under peak admissions traffic.',
    tech: ['React', 'Vite', 'Tailwind CSS', 'Vercel'],
    liveUrl: 'https://mpdet-webapp.vercel.app',
    repoUrl: 'https://github.com/prathamdahiya42/MPDET-Webapp',
  },

  /* ── HACKATHONS & COMPETITIONS ── */
  {
    id: 5,
    category: 'Hackathons',
    name: 'CivicLens — Imprenditore 5.0',
    tagline: 'Multimodal AI urban issue reporting system with geofenced proof-of-fix.',
    desc: 'Built for Problem Statement PS-05 at E-Cell RGPV (Bhopal) to modernize municipal issue reporting. Citizens snap and submit photo reports, which Gemini 2.5 Flash multimodally categorizes, scores for urgency (0–100), tags visually, and automatically redacts faces and license plates. Field officers resolve reports with strict ≤50m geofenced proof-of-fix verification, supported by a deterministic mock-AI offline fallback.',
    tech: ['TypeScript', 'Gemini 2.5 Flash', 'Multimodal AI', 'Geofencing', 'Privacy Blurring'],
    liveUrl: null,
    repoUrl: 'https://github.com/prathamdahiya42/Civiclens-prototype',
  },
  {
    id: 6,
    category: 'Hackathons',
    name: 'MediKiosk — Smart India Hackathon',
    tagline: 'AYUSH clinical intake kiosk with Ashtavidha/Dashavidha diagnostic banks.',
    desc: 'An AI-augmented healthcare triage kiosk engineered for Smart India Hackathon (SIH26047) across Patient, Doctor, and Admin portals. Features an Ashtavidha and Dashavidha Pariksha clinical question bank, an interactive Prakriti constitution quiz, and specialized symptom modules. Synthesizes clinical data into structured LLM summaries for doctors, complete with a deterministic offline fallback.',
    tech: ['TypeScript', 'React', 'LLMs', 'Healthcare AI', 'Vercel'],
    liveUrl: 'https://medikoisk.vercel.app',
    repoUrl: 'https://github.com/prathamdahiya42/medikoisk',
  },
  {
    id: 7,
    category: 'Hackathons',
    name: 'SIH Collab',
    tagline: 'Real-time hackathon war room featuring an autonomous AI 7th team member.',
    desc: 'A collaborative command center built for Smart India Hackathon squads of 6–9 members. Integrates an autonomous AI copilot that attends sessions and generates on-demand syntheses of team discussions, decisions, and action items. Built with Next.js 14.2 App Router, Supabase Realtime/RLS, embedded Jitsi video rooms, and client-side AES-256-GCM encryption for BYOK Groq, Gemini, and OpenRouter API keys.',
    tech: ['Next.js 14.2', 'TypeScript', 'Supabase Realtime', 'Jitsi', 'AES-256-GCM', 'Groq', 'Gemini'],
    liveUrl: null,
    repoUrl: 'https://github.com/prathamdahiya42/sih-team-workspace',
  },

  /* ── PERSONAL BUILDS ── */
  {
    id: 8,
    category: 'Personal Builds',
    name: 'EEE Pulse (UIT Batch App)',
    tagline: 'Multi-branch academic portal, timetable viewer, and attendance tracker.',
    desc: 'A comprehensive batch portal engineered for UIT RGPV students to manage academic schedules and daily campus workflow. Provides branch-specific PDF timetables, granular subject-level attendance calculations, and designated class-captain administrative powers. Delivers real-time branch and campus-wide bulletin feeds, peer chat rooms, and a searchable shared notes repository.',
    tech: ['TypeScript', 'React', 'Supabase', 'Tailwind CSS'],
    liveUrl: null,
    repoUrl: 'https://github.com/prathamdahiya42/EEE-Batch',
  },
  {
    id: 9,
    category: 'Personal Builds',
    name: 'Idroid',
    tagline: 'Offline-first, voice-activated personal AI assistant and alarm manager.',
    desc: 'A personal AI life-assistant web application featuring hands-free voice-triggered activation ("Hey Idroid"), customizable per-alarm ringtones, and contact-priority settings. Designed with an offline-first local-storage architecture, ensuring all core productivity reminders and alarms remain fully functional without internet access.',
    tech: ['TypeScript', 'Web Speech API', 'Audio API', 'LocalStorage', 'Vercel'],
    liveUrl: 'https://teamidroidprototype.vercel.app',
    repoUrl: 'https://github.com/prathamdahiya42/Team-Idroid-Prototype',
  },
  {
    id: 10,
    category: 'Personal Builds',
    name: 'Chess Game Analyzer',
    tagline: 'Free client-side chess analysis engine using Stockfish WASM and chess.js.',
    desc: 'A high-performance chess analysis web application built to offer deep game analysis without recurring platform subscriptions. Combines Stockfish compiled to WebAssembly with chess.js for instant client-side calculation and an in-house eval-delta move classification engine that flags inaccuracies and blunders. Features an interactive board interface with planned hand-drawn SVG chess pieces.',
    tech: ['React', 'TypeScript', 'Vite', 'Stockfish WASM', 'chess.js'],
    liveUrl: null,
    repoUrl: 'https://github.com/prathamdahiya42/Chess-game-analyzer',
  },

  /* ── FOR FUN ── */
  {
    id: 11,
    category: 'For Fun',
    name: 'Suryavanshi Bird',
    tagline: '928-line handcrafted HTML5 Canvas arcade engine in modular vanilla JS.',
    desc: 'A polished Flappy Bird recreation driven by a ~928-line custom game engine written in modular ES JavaScript with zero external game dependencies. Features custom collision detection, sprite physics, glassmorphic UI overlays, and 60fps Canvas rendering. Fully open-sourced as a deeply documented deep dive into pure vanilla JavaScript game mechanics.',
    tech: ['Vanilla JS', 'HTML5 Canvas', 'ES Modules', 'CSS Glassmorphism'],
    liveUrl: null,
    repoUrl: 'https://github.com/prathamdahiya42/Simple-game',
  },
];

const skillCategories = [
  {
    category: 'Frontend',
    skills: [
      'React',
      'Next.js 14 (App Router)',
      'Vite',
      'TypeScript',
      'JavaScript',
      'Tailwind CSS v4',
      'Framer Motion (Motion)',
      'React Router v7',
    ],
  },
  {
    category: 'Backend / Data',
    skills: [
      'Supabase (Postgres, Row-Level Security, Realtime)',
      'AES-256-GCM (BYOK key encryption)',
    ],
  },
  {
    category: 'CMS / Deploy',
    skills: [
      'Decap CMS (git-based headless CMS)',
      'Netlify Identity + Git Gateway',
      'Vercel',
      'Netlify',
    ],
  },
  {
    category: 'AI / APIs',
    skills: [
      'Gemini API (incl. Gemini 2.5 Flash multimodal)',
      'Groq',
      'OpenRouter',
    ],
  },
  {
    category: 'Other',
    skills: [
      'Stockfish WASM',
      'chess.js',
      'Jitsi (embedded video)',
      'HTML5 Canvas + ES Modules',
    ],
  },
];

const navLinks = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#content', label: 'Content' },
  { href: '#ask-agent', label: 'Ask AI' },
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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLanyardProject, setSelectedLanyardProject] = useState(null);
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('portfolio_non_hero_theme') || 'Dim';
    }
    return 'Dim';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio_non_hero_theme', themeMode);
    }
  }, [themeMode]);

  /* Rubber membrane tear reveal — additive overlay on project cards for non-All tabs */
  useEffect(() => {
    if (selectedCategory !== 'All') {
      const id = setTimeout(() => initRubberTear(), 150);
      return () => clearTimeout(id);
    }
  }, [selectedCategory]);

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

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
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

            {/* Non-Hero Theme Toggle: "Dim" vs "Daylight" */}
            <button
              type="button"
              onClick={() => setThemeMode((prev) => (prev === 'Dim' ? 'Daylight' : 'Dim'))}
              aria-label={`Current non-hero theme is ${themeMode}. Click to switch to ${themeMode === 'Dim' ? 'Daylight' : 'Dim'}`}
              title={`Switch non-hero theme to ${themeMode === 'Dim' ? 'Daylight' : 'Dim'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 100,
                border: themeMode === 'Dim'
                  ? '1px solid rgba(255, 255, 255, 0.18)'
                  : '1px solid rgba(0, 0, 0, 0.12)',
                background: themeMode === 'Dim'
                  ? 'rgba(10, 10, 10, 0.88)'
                  : 'rgba(255, 255, 255, 0.92)',
                color: themeMode === 'Dim' ? '#FFFFFF' : '#0F172A',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: themeMode === 'Dim'
                  ? '0 0 16px rgba(255, 107, 0, 0.22)'
                  : '0 2px 10px rgba(0, 0, 0, 0.06)',
                zIndex: 1002,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: themeMode === 'Dim' ? '#FF6B00' : '#F59E0B',
                  boxShadow: themeMode === 'Dim' ? '0 0 8px #FF6B00' : '0 0 6px #FBBF24',
                  display: 'inline-block',
                }}
              />
              <span>{themeMode}</span>
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* ══════════════════════════════════════════════════
            1. Hero Section (Effect 3 — All Layers)
            ══════════════════════════════════════════════════ */}
        <section id="hero" className="hero-section" aria-label="Introduction" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          {/* Interactive Background — Glass Reveal (Pristine color inside circle, Blurry B&W Sketch & Glitch outside) */}
          <GlassReveal
            image="/images/hero/FRONT01.webp"
            backgroundImage="/images/hero/FRONT02.webp"
            shape="circle"
            size={0.42}
            blurStrength={3.5}
            glitchStrength={0.025}
            glitchSpeed={4.0}
            sketchStrength={1.0}
            distortion={0.06}
            softness={0.006}
            glowColor={[0.85, 0.86, 0.90]}
          />

          {/* WebGL StarField (200 twinkling points) */}
          <StarField />

          {/* Subtle contrast vignette overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.05) 0%, rgba(245, 245, 245, 0.38) 85%)',
              pointerEvents: 'none',
            }}
          />

          {/* Layer 4 — Hero content: text */}
          <div
            className="hero-inner"
            style={{
              position: 'relative', zIndex: 3,
              width: '100%', maxWidth: 1200,
              padding: '2rem clamp(1.25rem, 4vw, 3rem)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* ── Text column ── */}
            <div className="hero-text-col" style={{ flex: 1, minWidth: 0, maxWidth: 780 }}>

              {/* Brand Pill */}
              <motion.div
                className="hero-brand-pill"
                {...(reduced ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } })}
                transition={{ duration: 0.6 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  borderRadius: 100,
                  background: 'rgba(234, 88, 12, 0.08)',
                  border: '1px solid rgba(234, 88, 12, 0.25)',
                  color: 'var(--accent-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', display: 'inline-block' }} />
                House VibeCoders
              </motion.div>

              {/* Layer 5 — TechText interactive name display */}
              <motion.div
                className="hero-name-wrapper"
                {...(reduced ? {} : { initial: { opacity: 0, y: 60 }, animate: { opacity: 1, y: 0 } })}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  width: '100%',
                  maxWidth: 820,
                  height: 'clamp(88px, 12vw, 136px)',
                  marginBottom: '0.65rem',
                }}
              >
                <h1 style={{ margin: 0, padding: 0, height: '100%' }}>
                  <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
                    Pratham Dahiya
                  </span>
                  {reduced ? (
                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(3.2rem, 7vw, 6.4rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#EA580C', lineHeight: 1.1, display: 'block' }}>
                      Pratham Dahiya
                    </span>
                  ) : (
                    <TechText
                      text="Pratham Dahiya"
                      fontFamily="'Sora', sans-serif"
                      reveal="letter"
                      color="#EA580C"
                      accentColor="#F97316"
                      fontSize={110}
                      fontWeight={700}
                      specks={12}
                      sweep
                    />
                  )}
                </h1>
              </motion.div>

              <motion.h2
                className="hero-subheading"
                {...(reduced ? {} : { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } })}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.25rem, 3vw, 2rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', lineHeight: 1.2 }}
              >
                Building AI&nbsp;Tools.<br />Shipping Real&nbsp;Products.
              </motion.h2>

              <motion.p
                className="hero-description"
                {...(reduced ? {} : { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } })}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', color: 'var(--text-secondary)', maxWidth: 500, marginBottom: '2rem', lineHeight: 1.65 }}
              >
                Self-taught developer building under the brand <strong>House VibeCoders</strong>. First-year EEE student at UIT RGPV, Bhopal with a JEE dropper background — shipping production web apps and multimodal AI products for real clients, not just tutorials.
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

              {/* Layer 5.5 — Credibility stat strip near Hero with SplitFlap departure-board ticker */}
              <motion.div
                className="hero-credibility-card"
                {...(reduced ? {} : { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } })}
                transition={{ duration: 0.8, delay: 0.35 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  marginTop: '2rem',
                  padding: '1rem 1.4rem',
                  borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(234, 88, 12, 0.18)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                  maxWidth: '100%',
                  width: 'fit-content',
                }}
              >
                {/* Departure Board Flip Ticker */}
                <div className="hero-ticker-row" style={{ display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto', paddingBottom: 2 }}>
                  <span className="hero-ticker-label" style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    flexShrink: 0,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block' }} />
                    Live Terminal:
                  </span>
                  <SplitFlapText
                    className="hero-split-flap"
                    words={['17 REPOSITORIES', '20+ GITHUB STARS', '4 CLIENT BUILDS', 'PROD VERIFIED']}
                    fontSize={14}
                    tileRadius={4}
                    gap={3}
                    padTo={16}
                    cycleDelay={2800}
                    flipDuration={0.09}
                    tileColor="#121216"
                    textColor="#FFA048"
                  />
                </div>

                <div style={{ width: '100%', height: 1, background: 'rgba(234, 88, 12, 0.14)' }} />

                <div className="hero-stats-row" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.75rem, 2vw, 1.6rem)', flexWrap: 'wrap' }}>
                  <div className="hero-stat-item" style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="stat-number" style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent-primary)', lineHeight: 1.1 }}>
                      <StatCounter target={17} />
                    </span>
                    <span className="stat-label" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Repositories
                    </span>
                  </div>

                  <div className="hero-stat-divider" style={{ width: 1, height: 28, background: 'rgba(234, 88, 12, 0.2)' }} />

                  <div className="hero-stat-item" style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="stat-number" style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent-primary)', lineHeight: 1.1 }}>
                      <StatCounter target={20} suffix="+" />
                    </span>
                    <span className="stat-label" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Stars
                    </span>
                  </div>

                  <div className="hero-stat-divider" style={{ width: 1, height: 28, background: 'rgba(234, 88, 12, 0.2)' }} />

                  <div className="hero-stat-item" style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="stat-number" style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent-primary)', lineHeight: 1.1 }}>
                      <StatCounter target={4} />
                    </span>
                    <span className="stat-label" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Client Projects Shipped
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Layer 6 — Atmospheric Horizon Dissolve (Smooth feather fade into active theme) */}
          <div
            className="hero-horizon-dissolve"
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 'clamp(160px, 24vh, 300px)',
              pointerEvents: 'none',
              zIndex: 2,
              background: themeMode === 'Dim'
                ? 'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.18) 25%, rgba(0, 0, 0, 0.55) 50%, rgba(0, 0, 0, 0.88) 78%, #000000 100%)'
                : 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.22) 25%, rgba(255, 255, 255, 0.60) 50%, rgba(255, 255, 255, 0.92) 78%, #FFFFFF 100%)',
              transition: 'background 0.4s ease',
            }}
          />

          {/* Layer 7 — Bouncing scroll indicator */}
          <motion.div
            className="hero-scroll-indicator"
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

        {/* ══════════════════════════════════════════════════
            Non-Hero Sections Wrapper with ASCII Tiles Background
            Isolated from Hero section. Hero is 100% frozen.
            ══════════════════════════════════════════════════ */}
        <div
          id="non-hero-wrapper"
          className={`non-hero-container theme-${themeMode.toLowerCase()}`}
          style={{
            position: 'relative',
            isolation: 'isolate',
          }}
        >
          {/* React Bits Pro ASCII Tiles Background */}
          <AsciiTiles mode={themeMode} />

          {/* Top Atmospheric Veil — Feather-fades ASCII tiles smoothly into the horizon */}
          <div
            className="non-hero-top-veil"
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 'clamp(100px, 14vh, 180px)',
              pointerEvents: 'none',
              zIndex: 1,
              background: themeMode === 'Dim'
                ? 'linear-gradient(to bottom, #000000 0%, rgba(0, 0, 0, 0.7) 35%, rgba(0, 0, 0, 0.25) 70%, rgba(0, 0, 0, 0) 100%)'
                : 'linear-gradient(to bottom, #FFFFFF 0%, rgba(255, 255, 255, 0.7) 35%, rgba(255, 255, 255, 0.25) 70%, rgba(255, 255, 255, 0) 100%)',
              transition: 'background 0.4s ease',
            }}
          />

          {/* Non-hero content layer */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <SectionDivider />

        {/* ══════════════════════════════════════════════════
            2. About Section
            ══════════════════════════════════════════════════ */}
        <section id="about" aria-label="About me" style={{ padding: 'clamp(5rem, 12vh, 10rem) 0', background: 'var(--bg-primary)', position: 'relative' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1.25rem, 4vw, 3rem)' }}>
            <ScrollReveal direction="up">
              <span style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-primary)', marginBottom: '1rem' }}>About</span>
            </ScrollReveal>
            <div style={{ maxWidth: 760 }}>
              <ScrollReveal direction="left">
                <p style={{ fontSize: 'clamp(1.05rem, 2vw, 1.2rem)', lineHeight: 1.8, color: 'var(--text-primary)', marginBottom: '1.75rem' }}>
                  I'm Pratham Dahiya — a self-taught full-stack developer and builder operating under the banner of <strong>House VibeCoders</strong>. Currently a first-year Electrical &amp; Electronics Engineering (EEE) student at UIT RGPV, Bhopal, my transition into serious engineering was forged during an intensive JEE dropper year. That pivotal chapter instilled a relentless work ethic: learning directly by building and shipping real products, never staying passive.
                </p>
              </ScrollReveal>
              <ScrollReveal direction="right" delay={0.1}>
                <p style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)', lineHeight: 1.85, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Instead of following endless tutorial loops, I architect web apps and AI-powered products for real clients and competitive hackathons. My shipped portfolio spans client e-commerce stores with headless Decap CMS, business booking engines with WhatsApp pipelines, and high-impact hackathon platforms like CivicLens (multimodal Gemini 2.5 Flash urban triage) and SIH Collab (real-time workspace with BYOK AES-256-GCM encryption).
                </p>
              </ScrollReveal>
              <ScrollReveal direction="left" delay={0.15}>
                <p style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1rem)', lineHeight: 1.85, color: 'var(--text-secondary)' }}>
                  Beyond code, I'm an editor who has cut over 200 videos in After Effects and CapCut, sharing technical breakdowns and dev journey insights with 2,000+ subscribers on YouTube. Whether writing clean full-stack logic or refining visual interactions, I treat every project as a production-grade deliverable.
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
                  { target: 17, suffix: '', label: 'Repositories on GitHub' },
                  { target: 20, suffix: '+', label: 'GitHub Stars' },
                  { target: 4, suffix: '', label: 'Client Projects Shipped' },
                  { target: 2000, suffix: '+', label: 'Tech Community / YouTube Subscribers' },
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
              <span style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-primary)', marginBottom: '1rem' }}>
                <DecryptedText
                  text="TECH STACK // STACK_MANIFEST"
                  speed={40}
                  maxIterations={12}
                  sequential={true}
                  revealDirection="start"
                  animateOn="view"
                />
              </span>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2.5rem' }}>Skills &amp; Technologies</h2>
            </ScrollReveal>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {skillCategories.map((group, groupIdx) => (
                <ScrollReveal key={group.category} direction="up" delay={groupIdx * 0.06}>
                  <div style={{
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: 12,
                    padding: '1.25rem 1.5rem',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--glass-shadow)',
                  }}>
                    <h3 style={{
                      fontFamily: "'Sora', sans-serif",
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: 'var(--accent-primary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', display: 'inline-block' }} />
                      {group.category}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                      {group.skills.map((skill) => (
                        <SkillBadge key={skill} name={skill} />
                      ))}
                    </div>
                  </div>
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
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Featured Projects</h2>
            </ScrollReveal>

            {/* Category Filter Tabs */}
            <ScrollReveal direction="up" delay={0.05}>
              <div
                className="project-filters"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.6rem',
                  marginBottom: '2.5rem',
                }}
              >
                {projectCategories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        padding: '0.55rem 1.25rem',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        background: isSelected ? 'var(--accent-primary)' : 'var(--bg-card)',
                        color: isSelected ? '#ffffff' : 'var(--text-primary)',
                        border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        boxShadow: isSelected ? '0 4px 14px var(--accent-glow)' : 'none',
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </ScrollReveal>

            <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {projects.map((p) => {
                const isAllTab = selectedCategory === 'All';
                const isVisible = isAllTab || p.category === selectedCategory;
                if (!isVisible) return null;

                // ── Part A: "All" Tab ONLY — Render PixelCard from React Bits ──
                if (isAllTab) {
                  const pixelColors = themeMode === 'Dim'
                    ? '#a855f7,#8b5cf6,#6366f1,#c084fc,#ea580c'
                    : '#cbd5e1,#94a3b8,#e2e8f0,#fdba74,#f59e0b';

                  const pixelCardStyle = themeMode === 'Dim'
                    ? {
                        '--pixel-card-border': 'rgba(168, 85, 247, 0.25)',
                        '--pixel-card-background': 'rgba(12, 10, 16, 0.85)',
                        '--pixel-card-active-color': 'rgba(168, 85, 247, 0.22)',
                      }
                    : {
                        '--pixel-card-border': 'rgba(0, 0, 0, 0.1)',
                        '--pixel-card-background': 'rgba(255, 255, 255, 0.65)',
                        '--pixel-card-active-color': 'rgba(234, 88, 12, 0.1)',
                      };

                  return (
                    <PixelCard
                      key={p.id}
                      colors={pixelColors}
                      gap={6}
                      speed={30}
                      style={pixelCardStyle}
                    >
                      <div className="pixel-card-content">
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.75rem' }}>
                          <div>
                            <span style={{ display: 'inline-block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                              {p.category}
                            </span>
                            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                              {p.name}
                            </h3>
                          </div>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '0.3rem 0.75rem',
                            borderRadius: 100,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            background: p.liveUrl ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 107, 0, 0.12)',
                            color: p.liveUrl ? '#22c55e' : 'var(--accent-secondary)',
                            border: p.liveUrl ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid var(--border-subtle)',
                          }}>
                            {p.liveUrl ? 'Live' : 'GitHub'}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: '0.65rem', lineHeight: 1.4 }}>
                          {p.tagline}
                        </p>

                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '1.25rem', flex: 1 }}>
                          {p.desc}
                        </p>

                        {/* Tech badges */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                          {p.tech.map((t) => (
                            <span
                              key={t}
                              style={{
                                fontSize: '0.72rem',
                                padding: '3px 8px',
                                borderRadius: 4,
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-secondary)',
                                fontFamily: 'monospace',
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* Card Buttons */}
                        <div style={{ display: 'flex', gap: '0.8rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', flexWrap: 'wrap' }}>
                          {p.liveUrl ? (
                            <>
                              <a
                                href={p.liveUrl}
                                target="_blank"
                                rel="noopener"
                                aria-label={`Live demo of ${p.name}`}
                                style={{
                                  fontSize: '0.82rem',
                                  fontWeight: 600,
                                  color: '#ffffff',
                                  background: 'var(--accent-primary)',
                                  border: '1px solid var(--accent-primary)',
                                  padding: '0.45rem 1rem',
                                  borderRadius: 6,
                                  transition: 'all 0.25s ease',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  boxShadow: '0 2px 10px var(--accent-glow)',
                                }}
                              >
                                Live Demo ↗
                              </a>
                              <a
                                href={p.repoUrl}
                                target="_blank"
                                rel="noopener"
                                aria-label={`View code for ${p.name} on GitHub`}
                                style={{
                                  fontSize: '0.82rem',
                                  fontWeight: 500,
                                  color: 'var(--text-primary)',
                                  background: 'var(--bg-card)',
                                  border: '1px solid var(--border-subtle)',
                                  padding: '0.45rem 1rem',
                                  borderRadius: 6,
                                  transition: 'all 0.25s ease',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                View Code ↗
                              </a>
                            </>
                          ) : (
                            <a
                              href={p.repoUrl}
                              target="_blank"
                              rel="noopener"
                              aria-label={`View code for ${p.name} on GitHub`}
                              style={{
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                color: '#ffffff',
                                background: 'var(--accent-primary)',
                                border: '1px solid var(--accent-primary)',
                                padding: '0.45rem 1rem',
                                borderRadius: 6,
                                transition: 'all 0.25s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                boxShadow: '0 2px 10px var(--accent-glow)',
                              }}
                            >
                              View Code ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </PixelCard>
                  );
                }

                // ── Part B: Other 4 Tabs — Retain card treatment + Trigger 3D Lanyard on Click ──
                return (
                  <div
                    key={p.id}
                    className="crt-card"
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      if (e.target.closest('a') || e.target.closest('.action-link')) return;
                      setSelectedLanyardProject(p);
                    }}
                    title="Click to inspect 3D interactive physics pass"
                  >
                    <TiltCard>
                      <div className="crt-card-content" style={{ padding: '2rem', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.75rem' }}>
                          <div>
                            <span style={{ display: 'inline-block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                              {p.category}
                            </span>
                            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                              {p.name}
                            </h3>
                          </div>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '0.3rem 0.75rem',
                            borderRadius: 100,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            background: p.liveUrl ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 107, 0, 0.12)',
                            color: p.liveUrl ? '#22c55e' : 'var(--accent-secondary)',
                            border: p.liveUrl ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid var(--border-subtle)',
                          }}>
                            {p.liveUrl ? 'Live' : 'GitHub'}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: '0.65rem', lineHeight: 1.4 }}>
                          {p.tagline}
                        </p>

                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '1.25rem', flex: 1 }}>
                          {p.desc}
                        </p>

                        {/* Tech badges */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                          {p.tech.map((t) => (
                            <span
                              key={t}
                              style={{
                                fontSize: '0.72rem',
                                padding: '3px 8px',
                                borderRadius: 4,
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-secondary)',
                                fontFamily: 'monospace',
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* Card Buttons + 3D Pass Trigger */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            {p.liveUrl ? (
                              <>
                                <a
                                  href={p.liveUrl}
                                  target="_blank"
                                  rel="noopener"
                                  className="action-link"
                                  aria-label={`Live demo of ${p.name}`}
                                  style={{
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    color: '#ffffff',
                                    background: 'var(--accent-primary)',
                                    border: '1px solid var(--accent-primary)',
                                    padding: '0.45rem 0.9rem',
                                    borderRadius: 6,
                                    transition: 'all 0.25s ease',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    boxShadow: '0 2px 10px var(--accent-glow)',
                                  }}
                                >
                                  Live ↗
                                </a>
                                <a
                                  href={p.repoUrl}
                                  target="_blank"
                                  rel="noopener"
                                  className="action-link"
                                  aria-label={`View code for ${p.name} on GitHub`}
                                  style={{
                                    fontSize: '0.82rem',
                                    fontWeight: 500,
                                    color: 'var(--text-primary)',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-subtle)',
                                    padding: '0.45rem 0.9rem',
                                    borderRadius: 6,
                                    transition: 'all 0.25s ease',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                  }}
                                >
                                  Code ↗
                                </a>
                              </>
                            ) : (
                              <a
                                href={p.repoUrl}
                                target="_blank"
                                rel="noopener"
                                className="action-link"
                                aria-label={`View code for ${p.name} on GitHub`}
                                style={{
                                  fontSize: '0.82rem',
                                  fontWeight: 600,
                                  color: '#ffffff',
                                  background: 'var(--accent-primary)',
                                  border: '1px solid var(--accent-primary)',
                                  padding: '0.45rem 0.9rem',
                                  borderRadius: 6,
                                  transition: 'all 0.25s ease',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  boxShadow: '0 2px 10px var(--accent-glow)',
                                }}
                              >
                                Code ↗
                              </a>
                            )}
                          </div>

                          {/* 3D Lanyard Preview Trigger Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedLanyardProject(p)}
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: 'var(--accent-primary)',
                              background: 'rgba(234, 88, 12, 0.08)',
                              border: '1px solid rgba(234, 88, 12, 0.28)',
                              padding: '0.42rem 0.85rem',
                              borderRadius: 6,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--accent-primary)';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(234, 88, 12, 0.08)';
                              e.currentTarget.style.color = 'var(--accent-primary)';
                            }}
                          >
                            <span>🪪 3D Card</span>
                          </button>
                        </div>
                      </div>
                    </TiltCard>
                  </div>
                );
              })}
            </div>

            {/* ── Part B: Lazy-Mounted 3D Physics Lanyard Modal ── */}
            <AnimatePresence>
              {selectedLanyardProject && (
                <Suspense fallback={null}>
                  <ProjectLanyardModal
                    project={selectedLanyardProject}
                    onClose={() => setSelectedLanyardProject(null)}
                    themeMode={themeMode}
                  />
                </Suspense>
              )}
            </AnimatePresence>
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
              <div id="showreel" style={{ aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-subtle)', marginBottom: '3rem', background: 'var(--bg-card)', boxShadow: 'var(--glass-shadow)' }}>
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
              <div className="yt-callout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', padding: '2rem 2.5rem', border: '1px solid var(--border-subtle)', borderRadius: 10, background: 'var(--bg-card)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', marginBottom: '3rem', flexWrap: 'wrap', boxShadow: 'var(--glass-shadow)' }}>
                <div>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>YouTube — Know Your Tech</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>2,000+ subscribers · AI tools, dev builds &amp; real-world tutorials</p>
                </div>
                <a href="https://youtube.com/@hey.prathamdahiya?si=lLfKA1n_icF0WDHe" target="_blank" rel="noopener" aria-label="Visit YouTube channel" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem 1.8rem', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 500, borderRadius: 6, background: 'var(--accent-primary)', color: '#fff', border: '1px solid var(--accent-primary)', transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 2px 10px var(--accent-glow)' }}>Visit Channel →</a>
              </div>
            </ScrollReveal>

            {/* Video Thumbnails */}
            <ScrollReveal direction="up" delay={0.2}>
              <div className="video-thumbs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                {['Building an AI App from Scratch', 'Claude API Deep Dive', 'My Dev Setup & Workflow'].map((title, i) => (
                  <a key={i} href="#" aria-label={`Video thumbnail ${i + 1}`} style={{ display: 'block', transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    <div role="img" aria-label="Video thumbnail placeholder" style={{ aspectRatio: '16/9', borderRadius: 8, background: 'var(--bg-card)', backdropFilter: 'blur(8px)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '0.75rem', transition: 'border-color 0.3s ease', boxShadow: 'var(--glass-shadow)' }}>
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
            6.5. Ask About Me // AI Chat Agent
            ══════════════════════════════════════════════════ */}
        <section id="ask-agent" aria-label="Ask about Pratham AI Agent" style={{ padding: 'clamp(5rem, 12vh, 10rem) 0', background: 'var(--bg-primary)', position: 'relative' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1.25rem, 4vw, 3rem)' }}>
            <ScrollReveal direction="up">
              <span style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-primary)', marginBottom: '1rem', textAlign: 'center' }}>
                AI Agent // Knowledge_Base
              </span>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', textAlign: 'center' }}>
                Ask About Me
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto 3rem', textAlign: 'center', lineHeight: 1.6 }}>
                Curious about my projects, engineering background, hackathons, or stack? Ask my custom AI assistant, grounded in my verified knowledge base.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.1}>
              <AgentChat />
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
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse at 50% 100%, var(--accent-glow), transparent 70%)', filter: 'blur(40px)' }} />
          </div>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1.25rem, 4vw, 3rem)', position: 'relative', zIndex: 2 }}>
            <ScrollReveal direction="up">
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', fontWeight: 700, color: 'var(--text-primary)', maxWidth: 700, margin: '0 auto 3rem', lineHeight: 1.35 }}>
                <BlurText
                  text="Open to collaborations, freelance work, and interesting problems — let's build something."
                  delay={55}
                  animateBy="words"
                  direction="top"
                  stepDuration={0.42}
                />
              </h2>
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

        {/* ══════════════════════════════════════════════════
            Footer
            ══════════════════════════════════════════════════ */}
        <footer style={{ padding: '2rem 0', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-primary)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1.25rem, 4vw, 3rem)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.03em' }}>&copy; 2026 · Built with intention.</p>
          </div>
        </footer>
          </div>
        </div>
      </main>
    </>
  );
}
