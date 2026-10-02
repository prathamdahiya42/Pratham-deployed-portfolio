import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAgent, MOOD_IMAGES } from '../context/AgentContext';

export default function AgentWidget({ themeMode = 'Dim' }) {
  const { mood, setMood, toggleChat, openChat, isChatOpen, currentImage } = useAgent();
  const reducedMotion = useReducedMotion();

  const [bubbleText, setBubbleText] = useState(null);
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);
  const bubbleTimerRef = useRef(null);

  const showBubble = useCallback((text, durationMs = 4500) => {
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    setBubbleText(text);
    if (durationMs > 0) {
      bubbleTimerRef.current = setTimeout(() => {
        setBubbleText(null);
        bubbleTimerRef.current = null;
      }, durationMs);
    }
  }, []);

  // 1. Initial Page Load Ambient Reaction: Shock for ~2s, then normal
  useEffect(() => {
    const hasLoaded = sessionStorage.getItem('idroid_initial_shock');
    if (!hasLoaded) {
      sessionStorage.setItem('idroid_initial_shock', 'true');
      setMood('shock', 2200);
    }

    // Speech bubble hint: "Ask me anything" appears 2.5s after load, disappears after 5s (once per session)
    const hintShown = sessionStorage.getItem('idroid_hint_shown');
    if (!hintShown) {
      sessionStorage.setItem('idroid_hint_shown', 'true');
      const hintTimer = setTimeout(() => {
        showBubble('👋 Hey there! Ask me anything about Pratham.');
      }, 2500);
      return () => clearTimeout(hintTimer);
    }
  }, [setMood, showBubble]);

  // 2. Inactivity Ambient Reaction: Sad after ~45s of no interaction
  useEffect(() => {
    let inactivityTimer;

    const resetInactivity = () => {
      clearTimeout(inactivityTimer);
      if (mood === 'sad') {
        setMood('normal');
      }
      inactivityTimer = setTimeout(() => {
        if (!isChatOpen) {
          setMood('sad', 6000);
          showBubble('Still here if you need any info! 💭', 3500);
        }
      }, 45000);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, resetInactivity, { passive: true }));
    resetInactivity();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach((ev) => window.removeEventListener(ev, resetInactivity));
    };
  }, [mood, isChatOpen, setMood, showBubble]);

  // 3. Section Reactions (Projects & Contact via IntersectionObserver, once per session)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const projectsShown = sessionStorage.getItem('idroid_react_projects');
    const contactShown = sessionStorage.getItem('idroid_react_contact');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          if (entry.target.id === 'projects' && !projectsShown) {
            sessionStorage.setItem('idroid_react_projects', 'true');
            setMood('sarcasm', 3500);
            showBubble('11 builds shipped! Click any card for the 3D pass. ⚡', 4000);
          } else if (entry.target.id === 'contact' && !contactShown) {
            sessionStorage.setItem('idroid_react_contact', 'true');
            setMood('normal', 3500);
            showBubble("Ready to build something cool? Drop Pratham a line! 📬", 4000);
          }
        });
      },
      { threshold: 0.25 }
    );

    const projEl = document.getElementById('projects');
    const contactEl = document.getElementById('contact');
    if (projEl) observer.observe(projEl);
    if (contactEl) observer.observe(contactEl);

    return () => observer.disconnect();
  }, [setMood, showBubble]);

  // 4. Mascot Click Handler & Easter Egg (5 rapid clicks triggers 'shock')
  const handleMascotClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setBubbleText(null);

    const now = Date.now();
    if (now - lastClickTimeRef.current < 450) {
      clickCountRef.current += 1;
    } else {
      clickCountRef.current = 1;
    }
    lastClickTimeRef.current = now;

    if (isChatOpen && clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      setMood('shock', 4000);
      showBubble('⚡ Whoa! That tickles! Easy on the clicks, chief!', 4000);
      return;
    }

    if (!isChatOpen) {
      openChat();
    } else {
      toggleChat();
    }
  };

  // 5. Idle Micro-expression Cycle (changes expression every ~2.8 - 3.5s when idle)
  useEffect(() => {
    if (isChatOpen) return;

    const microCycle = [
      { mood: 'sarcasm', duration: 1800, delay: 3200 },
      { mood: 'normal', duration: 3000, delay: 2800 },
      { mood: 'weird', duration: 2000, delay: 3500 },
      { mood: 'normal', duration: 3000, delay: 2800 },
      { mood: 'shock', duration: 1400, delay: 3400 },
      { mood: 'normal', duration: 3000, delay: 2800 },
    ];
    let stepIdx = 0;
    let timer = null;

    const tick = () => {
      const step = microCycle[stepIdx % microCycle.length];
      stepIdx++;
      timer = setTimeout(() => {
        if (!isChatOpen) {
          setMood(step.mood, step.duration);
        }
        tick();
      }, step.delay);
    };

    tick();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isChatOpen, setMood]);

  const isDim = themeMode === 'Dim';

  return (
    <div
      id="agent-mascot-root"
      aria-label="Floating AI Mascot"
      style={{
        position: 'fixed',
        bottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
        right: 'max(24px, env(safe-area-inset-right, 24px))',
        zIndex: 999990,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 10,
      }}
    >
      {/* ── Speech Bubble Hint ── */}
      <AnimatePresence>
        {bubbleText && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => {
              setBubbleText(null);
              openChat();
            }}
            style={{
              pointerEvents: 'auto',
              cursor: 'pointer',
              maxWidth: 240,
              padding: '9px 14px',
              borderRadius: '16px 16px 4px 16px',
              background: isDim ? 'rgba(20, 16, 32, 0.94)' : 'rgba(255, 255, 255, 0.95)',
              border: isDim ? '1px solid rgba(167, 139, 250, 0.35)' : '1px solid rgba(234, 88, 12, 0.25)',
              boxShadow: isDim
                ? '0 10px 30px rgba(0, 0, 0, 0.75), 0 0 20px rgba(167, 139, 250, 0.18)'
                : '0 10px 25px rgba(0, 0, 0, 0.1), 0 0 15px rgba(234, 88, 12, 0.12)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: isDim ? '#FFFFFF' : '#0F172A',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.8rem',
              fontWeight: 500,
              lineHeight: 1.4,
              userSelect: 'none',
            }}
          >
            {bubbleText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mascot Floating Button ── */}
      <motion.button
        type="button"
        onClick={handleMascotClick}
        onMouseEnter={() => {
          if (!isChatOpen) {
            setMood('sarcasm', 2500);
          }
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        animate={reducedMotion ? {} : { y: [0, -5, 0], scale: [1, 1.025, 1] }}
        transition={
          reducedMotion
            ? {}
            : {
                y: {
                  duration: 2.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                scale: {
                  duration: 2.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }
        }
        aria-label={`Idroid AI Assistant (Mood: ${mood}). Click to open chat.`}
        title={`Idroid AI Assistant (${mood}) — Click to chat`}
        style={{
          pointerEvents: 'auto',
          width: 'clamp(52px, 7vw, 64px)',
          height: 'clamp(52px, 7vw, 64px)',
          borderRadius: '50%',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDim
            ? 'radial-gradient(circle at 35% 30%, #201738 0%, #0d081e 80%)'
            : 'radial-gradient(circle at 35% 30%, #ffffff 0%, #f4f0ff 80%)',
          border: isDim
            ? '2px solid rgba(167, 139, 250, 0.5)'
            : '2px solid rgba(234, 88, 12, 0.4)',
          boxShadow: isDim
            ? '0 10px 28px rgba(0, 0, 0, 0.8), 0 0 22px rgba(167, 139, 250, 0.35)'
            : '0 8px 24px rgba(0, 0, 0, 0.12), 0 0 18px rgba(234, 88, 12, 0.22)',
          outline: 'none',
        }}
      >
        {/* Soft Ambient Glow Halo */}
        {!reducedMotion && (
          <motion.div
            aria-hidden="true"
            animate={{
              boxShadow: isDim
                ? [
                    '0 0 15px rgba(167, 139, 250, 0.25)',
                    '0 0 30px rgba(167, 139, 250, 0.5)',
                    '0 0 15px rgba(167, 139, 250, 0.25)',
                  ]
                : [
                    '0 0 12px rgba(234, 88, 12, 0.2)',
                    '0 0 24px rgba(234, 88, 12, 0.4)',
                    '0 0 12px rgba(234, 88, 12, 0.2)',
                  ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: -3,
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Expression Face with Smooth Crossfade */}
        <div
          style={{
            position: 'relative',
            width: '88%',
            height: '88%',
            borderRadius: '50%',
            overflow: 'hidden',
          }}
        >
          <AnimatePresence mode="sync">
            <motion.img
              key={mood}
              src={currentImage}
              alt={`Idroid expression: ${mood}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
          </AnimatePresence>
        </div>

        {/* Online Status Pill Badge */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: isChatOpen ? '#38BDF8' : '#22C55E',
            border: isDim ? '2px solid #0d081e' : '2px solid #ffffff',
            boxShadow: isChatOpen
              ? '0 0 8px #38BDF8'
              : '0 0 8px #22C55E',
          }}
        />
      </motion.button>
    </div>
  );
}
