import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgent, VALID_MOODS } from '../context/AgentContext';
import './AgentChatModal.css';

const SUGGESTED_QUESTIONS = [
  "What is Pratham working on right now?",
  "What are his core technical skills?",
  "Tell me about his hackathon & client builds",
  "How can I collaborate or hire him?",
];

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    content: "Hey there! I'm Idroid, Pratham's portfolio assistant. Ask me about his 11 shipped projects (like CivicLens, MediKiosk, or EEE Pulse), his tech stack, origin story, or how to work with him!",
    timestamp: 'Just now',
  },
];

export default function AgentChatModal({ themeMode = 'Dim' }) {
  const { mood, setMood, isChatOpen, closeChat, currentAvatar, pendingPrompt, setPendingPrompt } = useAgent();

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const isDim = themeMode === 'Dim';
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 640 : false));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll within the container only
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom(isStreaming ? 'auto' : 'smooth');
    }
  }, [messages, isStreaming, isLoading, isChatOpen, scrollToBottom]);

  // Focus input and handle Escape key when opened
  useEffect(() => {
    if (!isChatOpen) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeChat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isChatOpen, closeChat]);

  // Parse mood tag defensively
  const parseMoodAndCleanText = (raw) => {
    if (!raw) return { mood: 'normal', text: '' };

    // Check JSON response
    if (raw.trim().startsWith('{') && raw.trim().endsWith('}')) {
      try {
        const parsed = JSON.parse(raw.trim());
        if (parsed.text) {
          const m = VALID_MOODS.includes(parsed.mood) ? parsed.mood : 'normal';
          return { mood: m, text: String(parsed.text) };
        }
      } catch (_) {}
    }

    // Check [mood:xyz] prefix
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

    // Set mood to 'weird' (thinking) while waiting for the first token
    setMood('weird', 10000);

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
        setMood('sad', 6000);
        setErrorState({
          type: 'rate_limit',
          message: errorData.error || "You've reached the question limit (8 per minute). You can ask again shortly or email Pratham directly.",
        });
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setIsLoading(false);
        setMood('sad', 6000);
        setErrorState({
          type: 'network',
          message: errorData.error || "Idroid couldn't reach the model right now. Please try again in a few seconds.",
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

        // Try to parse mood tag from the start of the accumulated response
        if (!moodExtracted) {
          if (accumulatedRaw.includes(']')) {
            const parsed = parseMoodAndCleanText(accumulatedRaw);
            detectedMood = parsed.mood;
            moodExtracted = true;
            setMood(detectedMood, 8000);
          } else if (accumulatedRaw.length > 25) {
            moodExtracted = true;
            setMood('normal', 8000);
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

      // Finish streaming and persist detected mood for a short while
      setIsStreaming(false);
      setMood(detectedMood, 6000);

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        console.error('Chat error:', err);
        setMood('sad', 6000);
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
      setMood('normal');
    }
  };

  const handleResetChat = () => {
    if (isStreaming) handleStopGeneration();
    setMessages(INITIAL_MESSAGES);
    setErrorState(null);
    setMood('normal');
  };

  // Handle auto-sending pending prompt when opened with a prompt
  useEffect(() => {
    if (isChatOpen && pendingPrompt && !isLoading && !isStreaming) {
      handleSend(pendingPrompt);
      if (typeof setPendingPrompt === 'function') {
        setPendingPrompt(null);
      }
    }
  }, [isChatOpen, pendingPrompt, isLoading, isStreaming]);

  const handleCopy = (text, idx) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
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
              fontSize: '0.82em',
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
    <AnimatePresence>
      {isChatOpen && (
        <>
          {/* Mobile Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeChat}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 999990,
              display: isMobile ? 'block' : 'none',
            }}
            className="agent-chat-backdrop"
          />

          {/* Floating Chat Modal Panel */}
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Idroid AI Chat Panel"
            className="agent-chat-panel"
            style={{
              position: 'fixed',
              bottom: isMobile ? 0 : 96,
              right: isMobile ? 0 : 24,
              left: isMobile ? 0 : 'auto',
              width: isMobile ? '100%' : 'min(430px, calc(100vw - 32px))',
              height: isMobile ? '85vh' : 'min(620px, calc(100vh - 120px))',
              maxHeight: isMobile ? '85vh' : '84vh',
              zIndex: 999999,
              borderRadius: isMobile ? '22px 22px 0 0' : 20,
              background: isDim ? 'rgba(16, 12, 28, 0.96)' : 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: isDim ? '1px solid rgba(167, 139, 250, 0.4)' : '1px solid rgba(234, 88, 12, 0.3)',
              boxShadow: isDim
                ? '0 25px 65px rgba(0, 0, 0, 0.95), 0 0 35px rgba(167, 139, 250, 0.25)'
                : '0 20px 50px rgba(0, 0, 0, 0.18), 0 0 25px rgba(234, 88, 12, 0.18)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* ── Header ── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1.15rem',
                borderBottom: isDim ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                background: isDim ? 'rgba(255, 255, 255, 0.02)' : 'rgba(234, 88, 12, 0.04)',
                gap: 10,
              }}
            >
              {/* Left: Avatar + Identity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Live Expression Avatar */}
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
                  <AnimatePresence mode="sync">
                    <motion.img
                      key={mood}
                      src={currentAvatar}
                      alt={`Idroid mood: ${mood}`}
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        scale: isStreaming || isLoading ? [1, 1.06, 1] : 1,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        scale: isStreaming || isLoading ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.15 },
                        opacity: { duration: 0.15 },
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </AnimatePresence>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Idroid
                    </span>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        padding: '2px 7px',
                        borderRadius: 100,
                        background: isDim ? 'rgba(167, 139, 250, 0.18)' : 'rgba(234, 88, 12, 0.12)',
                        color: isDim ? '#C4B5FD' : '#EA580C',
                        border: isDim ? '1px solid rgba(167, 139, 250, 0.3)' : '1px solid rgba(234, 88, 12, 0.25)',
                      }}
                    >
                      {mood}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', lineHeight: 1.2 }}>
                    House VibeCoders AI Assistant
                  </span>
                </div>
              </div>

              {/* Right: Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Clear chat history"
                  aria-label="Clear chat history"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: 6,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={closeChat}
                  title="Close chat (Esc)"
                  aria-label="Close chat"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: 6,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Messages Feed ── */}
            <div
              ref={messagesContainerRef}
              className="agent-chat-messages"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                scrollBehavior: 'smooth',
              }}
            >
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      display: 'flex',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      width: '100%',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '86%',
                        padding: '0.75rem 1rem',
                        borderRadius: isUser ? '16px 16px 3px 16px' : '16px 16px 16px 3px',
                        background: isUser
                          ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                          : isDim
                          ? 'rgba(25, 20, 42, 0.85)'
                          : 'rgba(244, 240, 255, 0.85)',
                        border: isUser
                          ? 'none'
                          : isDim
                          ? '1px solid rgba(167, 139, 250, 0.22)'
                          : '1px solid rgba(234, 88, 12, 0.16)',
                        color: isUser ? '#FFFFFF' : 'var(--text-primary)',
                        fontSize: '0.84rem',
                        lineHeight: 1.55,
                        boxShadow: isUser
                          ? '0 4px 14px var(--accent-glow)'
                          : '0 2px 10px rgba(0, 0, 0, 0.05)',
                        position: 'relative',
                      }}
                    >
                      <div style={{ wordBreak: 'break-word' }}>
                        {isUser ? msg.content : renderFormattedContent(msg.content)}
                      </div>

                      {/* Footer: timestamp + copy */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: 6,
                          marginTop: '0.35rem',
                          fontSize: '0.66rem',
                          color: isUser ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)',
                        }}
                      >
                        <span>{msg.timestamp}</span>
                        {!isUser && msg.content && (
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.content, idx)}
                            title="Copy message"
                            aria-label="Copy message text"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'inherit',
                              cursor: 'pointer',
                              padding: 2,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {copiedIdx === idx ? (
                              <span style={{ color: '#22C55E' }}>✓</span>
                            ) : (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Thinking / Loading indicator */}
              {isLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 0.9rem', width: 'fit-content', borderRadius: 14, background: isDim ? 'rgba(25, 20, 42, 0.8)' : 'rgba(244, 240, 255, 0.8)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', animation: 'bounce 1s infinite 0ms' }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', animation: 'bounce 1s infinite 180ms' }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', animation: 'bounce 1s infinite 360ms' }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginLeft: 4 }}>Idroid is thinking...</span>
                </div>
              )}

              {/* Error Banner */}
              {errorState && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 10,
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#EF4444',
                    fontSize: '0.8rem',
                    lineHeight: 1.45,
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 500 }}>{errorState.message}</p>
                  {errorState.type === 'rate_limit' && (
                    <a
                      href="#contact"
                      onClick={closeChat}
                      style={{
                        display: 'inline-block',
                        marginTop: '0.35rem',
                        fontSize: '0.75rem',
                        color: 'var(--accent-primary)',
                        textDecoration: 'underline',
                        fontWeight: 600,
                      }}
                    >
                      Jump to contact section →
                    </a>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Suggested Questions Chips ── */}
            <div
              style={{
                padding: '0.4rem 0.9rem',
                borderTop: isDim ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
                display: 'flex',
                gap: 6,
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                scrollbarWidth: 'none',
              }}
            >
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading || isStreaming}
                  onClick={() => handleSend(q)}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    padding: '4px 10px',
                    borderRadius: 100,
                    background: isDim ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                    color: 'var(--text-secondary)',
                    border: isDim ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                    cursor: isLoading || isStreaming ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && !isStreaming) {
                      e.currentTarget.style.color = 'var(--accent-primary)';
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.borderColor = isDim ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* ── Input Bar ── */}
            <div
              style={{
                padding: '0.75rem 1rem',
                borderTop: isDim ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                background: isDim ? 'rgba(10, 8, 20, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                maxLength={500}
                placeholder="Ask Idroid anything..."
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
                  padding: '0.65rem 0.95rem',
                  fontSize: '0.84rem',
                  borderRadius: 10,
                  border: isDim ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(0, 0, 0, 0.14)',
                  background: isDim ? 'rgba(20, 16, 34, 0.8)' : 'rgba(248, 248, 250, 0.9)',
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
                    padding: '0.65rem 0.95rem',
                    borderRadius: 10,
                    background: '#EF4444',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.78rem',
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
                  title="Send message"
                  aria-label="Send message"
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: 10,
                    background: input.trim() && !isLoading ? 'var(--accent-primary)' : 'rgba(150, 150, 150, 0.25)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                    transition: 'background 0.2s',
                    boxShadow: input.trim() && !isLoading ? '0 2px 10px var(--accent-glow)' : 'none',
                  }}
                >
                  Send
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
