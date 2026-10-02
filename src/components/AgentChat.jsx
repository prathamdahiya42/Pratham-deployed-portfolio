import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgent, VALID_MOODS, MOOD_IMAGES, MOOD_AVATARS } from '../context/AgentContext';

const MOOD_VOICE_LINES = {
  normal: "Online and ready. Ask me about Pratham's 11 projects, stack, or House VibeCoders.",
  sarcasm: "Yeah, because building full-stack apps in your first college year is totally everyday stuff.",
  shock: "Whoa! Did you see the 3D physics cards in the Projects section?!",
  weird: "Crunching neural vectors... calculating how Pratham survived the JEE drop year.",
  frustrated: "When you deploy at 2 AM and the CSS grid breaks on Safari... again.",
  sad: "45 seconds of silence? Did you leave me all alone in the matrix?",
};

const EXPRESSION_ITEMS = [
  { id: 'normal', name: 'Normal', icon: '😐', tag: 'Ready' },
  { id: 'sarcasm', name: 'Sarcasm', icon: '😏', tag: 'Witty' },
  { id: 'shock', name: 'Shock', icon: '⚡', tag: 'Amazed' },
  { id: 'weird', name: 'Weird', icon: '🤔', tag: 'Thinking' },
  { id: 'frustrated', name: 'Frustrated', icon: '😤', tag: 'Debugging' },
  { id: 'sad', name: 'Sad', icon: '🥺', tag: 'Waiting' },
];

const QUICK_PROJECTS = [
  {
    name: 'CivicLens',
    category: 'Hackathon Winner',
    icon: '🪪',
    tag: 'React 19 · FastAPI · Llama-Vision',
    prompt: 'Tell me about CivicLens and what problem it solves',
  },
  {
    name: 'EEE Pulse',
    category: 'Department Portal',
    icon: '⚡',
    tag: 'Next.js · Supabase · Real-time',
    prompt: 'Explain the EEE Pulse department portal and features',
  },
  {
    name: 'Chess Predictor',
    category: 'ML Research',
    icon: '♟️',
    tag: 'Random Forest · 82% Acc · Chess.js',
    prompt: 'How does the Chess Move Predictor ML model work?',
  },
  {
    name: 'Crafted by Habiba',
    category: 'Client E-Commerce',
    icon: '🛍️',
    tag: 'Decap CMS · Serverless · Netlify',
    prompt: 'Tell me about Crafted by Habiba e-commerce storefront',
  },
];

const SUGGESTED_QUESTIONS = [
  "What is Pratham working on right now?",
  "What are his core technical skills?",
  "Tell me about his hackathon & client builds",
  "How can I collaborate or hire him?",
];

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    content: "Hey there! I'm Idroid, Pratham's portfolio assistant. Ask me about his 11 shipped projects (like CivicLens, MediKiosk, or EEE Pulse), his tech stack, JEE origin story, or how to work with him!",
    timestamp: 'Just now',
  },
];

export default function AgentChat({ themeMode = 'Dim' }) {
  const { mood, setMood, currentImage, currentAvatar, openChat } = useAgent();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [autoCycle, setAutoCycle] = useState(true);
  const [activeVoiceLine, setActiveVoiceLine] = useState(MOOD_VOICE_LINES.normal);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const isDim = themeMode === 'Dim';

  // Auto-cycle expression pictures every 2.8s when enabled and idle
  useEffect(() => {
    if (!autoCycle || isStreaming || isLoading) return;

    const interval = setInterval(() => {
      const moods = ['normal', 'sarcasm', 'shock', 'weird', 'frustrated', 'sad'];
      const currentIndex = moods.indexOf(mood);
      const nextMood = moods[(currentIndex + 1) % moods.length];
      setMood?.(nextMood, 3200);
      setActiveVoiceLine(MOOD_VOICE_LINES[nextMood] || MOOD_VOICE_LINES.normal);
    }, 2800);

    return () => clearInterval(interval);
  }, [autoCycle, mood, isStreaming, isLoading, setMood]);

  // Update voice line whenever mood changes
  useEffect(() => {
    if (MOOD_VOICE_LINES[mood]) {
      setActiveVoiceLine(MOOD_VOICE_LINES[mood]);
    }
  }, [mood]);

  // Auto-scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, isLoading, scrollToBottom]);

  // Parse mood tag defensively
  const parseMoodAndCleanText = (raw) => {
    if (!raw) return { mood: 'normal', text: '' };

    if (raw.trim().startsWith('{') && raw.trim().endsWith('}')) {
      try {
        const parsed = JSON.parse(raw.trim());
        if (parsed.text) {
          const m = VALID_MOODS.includes(parsed.mood) ? parsed.mood : 'normal';
          return { mood: m, text: String(parsed.text) };
        }
      } catch (_) {}
    }

    const match = raw.match(/^\[mood:([a-z]+)\]\s*/i);
    if (match) {
      const parsedMood = match[1].toLowerCase();
      const m = VALID_MOODS.includes(parsedMood) ? parsedMood : 'normal';
      const cleanText = raw.slice(match[0].length);
      return { mood: m, text: cleanText };
    }

    return { mood: 'normal', text: raw };
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading || isStreaming) return;

    if (query.length > 500) {
      setErrorState({
        type: 'validation',
        message: 'Message exceeds 500 characters. Please shorten your question.',
      });
      return;
    }

    setErrorState(null);
    setInput('');

    const userMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);

    // Pause auto-cycle during active chat
    setAutoCycle(false);
    setMood?.('weird', 10000);

    const assistantPlaceholder = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const payloadMessages = newHistory.slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: payloadMessages }),
        signal: abortControllerRef.current.signal,
      });

      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        setIsLoading(false);
        setMood?.('sad', 6000);
        setErrorState({
          type: 'rate_limit',
          message: errorData.error || "You've reached the question limit (8 per minute). You can ask again in a moment or contact Pratham directly below.",
        });
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setIsLoading(false);
        setMood?.('sad', 6000);
        setErrorState({
          type: 'network',
          message: errorData.error || "Idroid couldn't process that question right now. Please try again in a few seconds.",
        });
        return;
      }

      setIsLoading(false);
      setIsStreaming(true);
      setMessages((prev) => [...prev, assistantPlaceholder]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedRaw = '';
      let detectedMood = 'normal';
      let moodExtracted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedRaw += chunk;

        if (!moodExtracted) {
          if (accumulatedRaw.includes(']')) {
            const parsed = parseMoodAndCleanText(accumulatedRaw);
            detectedMood = parsed.mood;
            moodExtracted = true;
            setMood?.(detectedMood, 8000);
          } else if (accumulatedRaw.length > 25) {
            moodExtracted = true;
            setMood?.('normal', 8000);
          }
        }

        const { text: cleanText } = parseMoodAndCleanText(accumulatedRaw);

        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: cleanText,
            };
          }
          return updated;
        });
      }

      setIsStreaming(false);
      setMood?.(detectedMood, 6000);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        console.error('Chat error:', err);
        setMood?.('sad', 6000);
        setErrorState({
          type: 'network',
          message: "Connection lost while communicating with Idroid. Please try again.",
        });
      }
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setIsLoading(false);
      setMood?.('normal');
    }
  };

  const handleResetChat = () => {
    if (isStreaming) handleStopGeneration();
    setMessages(INITIAL_MESSAGES);
    setErrorState(null);
    setMood?.('normal');
  };

  const handleCopy = (text, idx) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  };

  const handleSelectMood = (moodId) => {
    setAutoCycle(false);
    setMood?.(moodId, 5000);
    if (MOOD_VOICE_LINES[moodId]) {
      setActiveVoiceLine(MOOD_VOICE_LINES[moodId]);
    }
  };

  const renderFormattedContent = (content) => {
    if (!content) return null;
    const parts = content.split(/(\*\*.*?\*\*|`.*?`|\n)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: isDim ? '#FFFFFF' : '#0F172A', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            style={{
              padding: '2px 5px',
              borderRadius: 4,
              fontSize: '0.84em',
              background: isDim ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
              color: isDim ? '#FFA048' : '#C2410C',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part === '\n') {
        return <br key={i} />;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div
      className="agent-studio-wrapper"
      style={{
        width: '100%',
        maxWidth: 1040,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      {/* ══════════════════════════════════════════════════
          1. IDROID EXPRESSION STUDIO & PICTURE GALLERY
          ══════════════════════════════════════════════════ */}
      <div
        style={{
          background: isDim ? 'rgba(16, 12, 28, 0.82)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 20,
          border: isDim ? '1px solid rgba(167, 139, 250, 0.28)' : '1px solid rgba(234, 88, 12, 0.22)',
          boxShadow: isDim
            ? '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 30px rgba(167, 139, 250, 0.15)'
            : '0 16px 40px rgba(0, 0, 0, 0.06), 0 0 25px rgba(234, 88, 12, 0.12)',
          padding: 'clamp(1.25rem, 3vw, 2rem)',
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 320px) 1fr',
          gap: '2rem',
          alignItems: 'center',
          transition: 'all 0.4s ease',
        }}
        className="agent-studio-grid"
      >
        {/* Left: Large Animated Portrait & Voice Line */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* Portrait Frame with Breathing & Glowing Rings */}
          <div
            style={{
              position: 'relative',
              width: 'clamp(130px, 16vw, 170px)',
              height: 'clamp(130px, 16vw, 170px)',
              borderRadius: '50%',
              padding: 5,
              background: isDim
                ? 'radial-gradient(circle, rgba(167, 139, 250, 0.3) 0%, rgba(20, 16, 36, 0.9) 70%)'
                : 'radial-gradient(circle, rgba(234, 88, 12, 0.2) 0%, rgba(255, 255, 255, 0.95) 70%)',
              border: isDim ? '2px solid rgba(167, 139, 250, 0.5)' : '2px solid rgba(234, 88, 12, 0.4)',
              boxShadow: isDim
                ? '0 0 35px rgba(167, 139, 250, 0.35), inset 0 0 20px rgba(167, 139, 250, 0.2)'
                : '0 0 30px rgba(234, 88, 12, 0.25), inset 0 0 15px rgba(234, 88, 12, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <motion.div
              animate={{ y: [0, -4, 0], scale: [1, 1.02, 1] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '100%', height: '100%', position: 'relative', borderRadius: '50%', overflow: 'hidden' }}
            >
              <AnimatePresence mode="sync">
                <motion.img
                  key={mood}
                  src={currentImage}
                  alt={`Idroid portrait - ${mood}`}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.06 }}
                  transition={{ duration: 0.25 }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </AnimatePresence>
            </motion.div>

            {/* Status Beacon */}
            <span
              style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: '#22C55E',
                border: isDim ? '2.5px solid #0d081e' : '2.5px solid #ffffff',
                boxShadow: '0 0 10px #22C55E',
              }}
            />
          </div>

          {/* Active Expression Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.4rem' }}>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Idroid
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '2px 8px',
                borderRadius: 100,
                background: isDim ? 'rgba(167, 139, 250, 0.2)' : 'rgba(234, 88, 12, 0.12)',
                color: isDim ? '#C4B5FD' : '#EA580C',
                border: isDim ? '1px solid rgba(167, 139, 250, 0.35)' : '1px solid rgba(234, 88, 12, 0.25)',
              }}
            >
              MOOD: {mood.toUpperCase()}
            </span>
          </div>

          {/* Dynamic Voice Line / Quote */}
          <motion.p
            key={activeVoiceLine}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.45,
              maxWidth: 260,
              fontStyle: 'italic',
            }}
          >
            &ldquo;{activeVoiceLine}&rdquo;
          </motion.p>
        </div>

        {/* Right: 6 Expression Picture Cards + Auto-Animate Control */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                Expression Matrix // 6 Neural States
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Click any portrait to trigger expression, or let auto-animation cycle every 2.8s:
              </p>
            </div>

            {/* Auto-Animation Toggle Button */}
            <button
              type="button"
              onClick={() => setAutoCycle(!autoCycle)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: autoCycle
                  ? isDim
                    ? 'rgba(167, 139, 250, 0.2)'
                    : 'rgba(234, 88, 12, 0.15)'
                  : isDim
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.05)',
                color: autoCycle
                  ? isDim
                    ? '#C4B5FD'
                    : '#EA580C'
                  : 'var(--text-secondary)',
                border: autoCycle
                  ? isDim
                    ? '1px solid rgba(167, 139, 250, 0.4)'
                    : '1px solid rgba(234, 88, 12, 0.3)'
                  : '1px solid var(--border-subtle)',
                transition: 'all 0.25s ease',
              }}
            >
              <span style={{ fontSize: '0.9rem' }}>{autoCycle ? '▶' : '⏸'}</span>
              <span>{autoCycle ? 'Auto-Cycle: Active (2.8s)' : 'Auto-Cycle: Paused'}</span>
            </button>
          </div>

          {/* 6 Pictures Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {EXPRESSION_ITEMS.map((item) => {
              const isSelected = mood === item.id;
              const imgSrc = MOOD_AVATARS[item.id] || MOOD_IMAGES[item.id];

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectMood(item.id)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '0.75rem 0.5rem',
                    borderRadius: 14,
                    cursor: 'pointer',
                    background: isSelected
                      ? isDim
                        ? 'rgba(167, 139, 250, 0.18)'
                        : 'rgba(234, 88, 12, 0.12)'
                      : isDim
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'rgba(255, 255, 255, 0.6)',
                    border: isSelected
                      ? isDim
                        ? '2px solid #A78BFA'
                        : '2px solid #EA580C'
                      : isDim
                      ? '1px solid rgba(255, 255, 255, 0.08)'
                      : '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: isSelected
                      ? isDim
                        ? '0 0 16px rgba(167, 139, 250, 0.35)'
                        : '0 0 14px rgba(234, 88, 12, 0.25)'
                      : 'none',
                    transition: 'all 0.25s ease',
                    outline: 'none',
                  }}
                >
                  {/* Picture Thumbnail */}
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      marginBottom: '0.45rem',
                      background: isDim ? '#0d081e' : '#f0f0f5',
                      border: isSelected
                        ? isDim
                          ? '1.5px solid #A78BFA'
                          : '1.5px solid #EA580C'
                        : '1px solid transparent',
                    }}
                  >
                    <img
                      src={imgSrc}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>

                  <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>
                    {item.tag}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          2. QUICK PROJECT INQUIRIES (Visual Picture Cards)
          ══════════════════════════════════════════════════ */}
      <div>
        <div style={{ marginBottom: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-primary)' }}>
            Quick Prompts // Featured Builds
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Click any build to ask Idroid</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.85rem',
          }}
        >
          {QUICK_PROJECTS.map((proj, i) => (
            <motion.button
              key={i}
              type="button"
              onClick={() => handleSend(proj.prompt)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '0.9rem 1.1rem',
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
                background: isDim ? 'rgba(20, 16, 34, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                border: isDim ? '1px solid rgba(167, 139, 250, 0.18)' : '1px solid rgba(234, 88, 12, 0.15)',
                boxShadow: isDim ? '0 4px 15px rgba(0, 0, 0, 0.4)' : '0 4px 15px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>{proj.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {proj.name}
                  </span>
                  <span style={{ fontSize: '0.62rem', color: isDim ? '#C4B5FD' : '#EA580C', fontWeight: 600 }}>
                    {proj.category}
                  </span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.35, margin: 0 }}>
                  {proj.tag}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          3. LIVE CHAT TERMINAL (Theme Aware: Dim & Daylight)
          ══════════════════════════════════════════════════ */}
      <div
        className="agent-chat-terminal"
        style={{
          width: '100%',
          background: isDim ? 'rgba(12, 10, 22, 0.92)' : 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 18,
          border: isDim ? '1px solid rgba(167, 139, 250, 0.3)' : '1px solid rgba(234, 88, 12, 0.22)',
          boxShadow: isDim
            ? '0 25px 65px rgba(0, 0, 0, 0.9), 0 0 35px rgba(167, 139, 250, 0.18)'
            : '0 20px 50px rgba(0, 0, 0, 0.08), 0 0 25px rgba(234, 88, 12, 0.12)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.4s ease',
        }}
      >
        {/* Terminal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.9rem 1.35rem',
            borderBottom: isDim ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
            background: isDim ? 'rgba(255, 255, 255, 0.02)' : 'rgba(234, 88, 12, 0.04)',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {/* Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                position: 'relative',
                width: 38,
                height: 38,
                borderRadius: '50%',
                overflow: 'hidden',
                border: isDim ? '1.5px solid rgba(167, 139, 250, 0.5)' : '1.5px solid rgba(234, 88, 12, 0.4)',
                background: isDim ? '#0d081e' : '#ffffff',
                flexShrink: 0,
                boxShadow: isDim ? '0 0 10px rgba(167, 139, 250, 0.3)' : '0 0 10px rgba(234, 88, 12, 0.2)',
              }}
            >
              <img
                src={currentAvatar || '/agent/avatar/normal.webp'}
                alt={`Idroid expression: ${mood}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Idroid
                </span>
                <span
                  style={{
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '2px 8px',
                    borderRadius: 100,
                    background: isDim ? 'rgba(167, 139, 250, 0.18)' : 'rgba(234, 88, 12, 0.12)',
                    color: isDim ? '#C4B5FD' : '#EA580C',
                    border: isDim ? '1px solid rgba(167, 139, 250, 0.3)' : '1px solid rgba(234, 88, 12, 0.25)',
                  }}
                >
                  AI AGENT // {mood ? mood.toUpperCase() : 'NORMAL'}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                House VibeCoders Neural Interface · Model: llama-3.1-8b-instant
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Live Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#22C55E',
                  boxShadow: '0 0 8px #22C55E',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Online
              </span>
            </div>

            {/* Pop Out Floating Mascot Window */}
            {openChat && (
              <button
                type="button"
                onClick={openChat}
                title="Pop out into floating mascot window"
                aria-label="Open floating mascot chat modal"
                style={{
                  background: isDim ? 'rgba(167, 139, 250, 0.12)' : 'rgba(234, 88, 12, 0.08)',
                  border: isDim ? '1px solid rgba(167, 139, 250, 0.3)' : '1px solid rgba(234, 88, 12, 0.25)',
                  color: isDim ? '#C4B5FD' : 'var(--accent-primary)',
                  cursor: 'pointer',
                  padding: '5px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  borderRadius: 7,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>Floating Window ↗</span>
              </button>
            )}

            {/* Clear Chat Button */}
            <button
              type="button"
              onClick={handleResetChat}
              title="Reset conversation"
              aria-label="Reset conversation"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px 8px',
                fontSize: '0.75rem',
                borderRadius: 6,
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* ── Messages Feed ── */}
        <div
          style={{
            height: 'clamp(320px, 44vh, 460px)',
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            scrollBehavior: 'smooth',
          }}
        >
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    maxWidth: '86%',
                    padding: '0.85rem 1.15rem',
                    borderRadius: isUser ? '16px 16px 3px 16px' : '16px 16px 16px 3px',
                    background: isUser
                      ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                      : isDim
                      ? 'rgba(22, 17, 38, 0.9)'
                      : 'rgba(246, 246, 250, 0.95)',
                    color: isUser ? '#FFFFFF' : 'var(--text-primary)',
                    boxShadow: isUser
                      ? '0 4px 14px var(--accent-glow)'
                      : isDim
                      ? '0 4px 16px rgba(0, 0, 0, 0.4)'
                      : '0 2px 10px rgba(0, 0, 0, 0.04)',
                    border: isUser
                      ? 'none'
                      : isDim
                      ? '1px solid rgba(167, 139, 250, 0.22)'
                      : '1px solid rgba(0, 0, 0, 0.08)',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    position: 'relative',
                  }}
                >
                  {!isUser && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 6,
                        borderBottom: isDim ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
                        paddingBottom: 4,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <img
                          src={currentAvatar || '/agent/avatar/normal.webp'}
                          alt="Idroid avatar"
                          style={{ width: 17, height: 17, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isDim ? '#C4B5FD' : 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          ⚡ Idroid ({mood || 'normal'})
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 400 }}>{msg.timestamp}</span>
                      </div>

                      {/* Copy button */}
                      {msg.content && !isStreaming && (
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.content, idx)}
                          title="Copy reply"
                          aria-label="Copy message text"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: copiedIdx === idx ? '#22C55E' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            padding: '2px 5px',
                            borderRadius: 4,
                          }}
                        >
                          {copiedIdx === idx ? '✓ Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                  )}

                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {isUser ? msg.content : renderFormattedContent(msg.content)}
                    {isStreaming && idx === messages.length - 1 && !isUser && (
                      <span
                        style={{
                          display: 'inline-block',
                          width: 8,
                          height: 15,
                          background: isDim ? '#C4B5FD' : 'var(--accent-primary)',
                          marginLeft: 4,
                          verticalAlign: 'middle',
                          animation: 'pulse 0.8s infinite',
                        }}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Thinking Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', justifyContent: 'flex-start' }}
            >
              <div
                style={{
                  padding: '0.75rem 1.1rem',
                  borderRadius: '16px 16px 16px 3px',
                  background: isDim ? 'rgba(22, 17, 38, 0.9)' : 'rgba(246, 246, 250, 0.95)',
                  border: isDim ? '1px solid rgba(167, 139, 250, 0.22)' : '1px solid rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <img
                  src={currentAvatar || '/agent/avatar/weird.webp'}
                  alt="Idroid thinking"
                  style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Idroid is thinking</span>
                <span style={{ display: 'inline-flex', gap: 4 }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: isDim ? '#A78BFA' : 'var(--accent-primary)', animation: 'bounce 1.4s infinite' }} />
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: isDim ? '#A78BFA' : 'var(--accent-primary)', animation: 'bounce 1.4s infinite 0.2s' }} />
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: isDim ? '#A78BFA' : 'var(--accent-primary)', animation: 'bounce 1.4s infinite 0.4s' }} />
                </span>
              </div>
            </motion.div>
          )}

          {/* Error Banner */}
          {errorState && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '0.85rem 1.1rem',
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
                fontSize: '0.84rem',
                lineHeight: 1.5,
              }}
            >
              <strong>Error:</strong> {errorState.message}
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Suggested Prompts Chips ── */}
        <div
          style={{
            padding: '0.65rem 1.25rem',
            borderTop: isDim ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
            background: isDim ? 'rgba(16, 12, 28, 0.7)' : 'rgba(250, 250, 252, 0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            overflowX: 'auto',
          }}
        >
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 600 }}>
            Try asking:
          </span>
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(q)}
              disabled={isLoading || isStreaming}
              style={{
                fontSize: '0.74rem',
                padding: '4px 10px',
                borderRadius: 100,
                background: isDim ? 'rgba(167, 139, 250, 0.12)' : 'rgba(234, 88, 12, 0.08)',
                border: isDim ? '1px solid rgba(167, 139, 250, 0.25)' : '1px solid rgba(234, 88, 12, 0.2)',
                color: isDim ? '#C4B5FD' : 'var(--accent-primary)',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* ── Input Bar ── */}
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderTop: isDim ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
            background: isDim ? 'rgba(12, 10, 22, 0.95)' : 'rgba(255, 255, 255, 0.98)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            maxLength={500}
            placeholder="Ask Idroid about Pratham's builds, skills, or origin story..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '0.75rem 1.1rem',
              fontSize: '0.88rem',
              borderRadius: 12,
              border: isDim ? '1px solid rgba(167, 139, 250, 0.25)' : '1px solid rgba(0, 0, 0, 0.12)',
              background: isDim ? 'rgba(20, 16, 36, 0.9)' : 'rgba(246, 246, 250, 0.95)',
              color: 'var(--text-primary)',
              outline: 'none',
              fontFamily: "'Inter', sans-serif",
            }}
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={handleStopGeneration}
              title="Stop generating"
              aria-label="Stop generating reply"
              style={{
                padding: '0.75rem 1.2rem',
                borderRadius: 12,
                background: '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              Stop
            </button>
          ) : (
            <button
              type="button"
              disabled={!input.trim() || isLoading}
              onClick={() => handleSend()}
              title="Send question"
              aria-label="Send message"
              style={{
                padding: '0.75rem 1.35rem',
                borderRadius: 12,
                background: input.trim() && !isLoading ? 'var(--accent-primary)' : 'rgba(150, 150, 150, 0.25)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: input.trim() && !isLoading ? '0 2px 10px var(--accent-glow)' : 'none',
              }}
            >
              Send ↵
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
