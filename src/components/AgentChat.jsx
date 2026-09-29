import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTED_QUESTIONS = [
  "What is Pratham working on right now?",
  "What are his core technical skills?",
  "Tell me about his hackathon & client builds",
  "How can I collaborate or hire him?",
];

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    content: "Hey there! I'm Pratham's portfolio AI agent. Ask me anything about his projects (like Chess Analyzer, EEE Pulse, or MediKiosk), his tech stack, JEE origin story, or how to work with him!",
    timestamp: 'Just now',
  },
];

export default function AgentChat() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorState, setErrorState] = useState(null); // { type: 'rate_limit' | 'network', message: string }
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isInitialMount = useRef(true);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Auto-scroll within the chat container ONLY (does NOT hijack page/window scroll)
  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    scrollToBottom(isStreaming ? 'auto' : 'smooth');
  }, [messages, isStreaming, isLoading]);

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

    // Prepare assistant placeholder message
    const assistantPlaceholder = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Keep last 8 messages for context payload
    const payloadMessages = newHistory.slice(-8).map(m => ({
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

      // Handle Rate Limiting (429)
      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        setIsLoading(false);
        setErrorState({
          type: 'rate_limit',
          message: errorData.error || "You've reached the question limit (8 per minute). You can ask again in a moment or contact Pratham directly below.",
        });
        return;
      }

      // Handle other non-200 errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setIsLoading(false);
        setErrorState({
          type: 'network',
          message: errorData.error || "The AI agent couldn't process that question right now. Please try again in a few seconds.",
        });
        return;
      }

      // Start streaming response
      setIsLoading(false);
      setIsStreaming(true);

      // Add empty assistant message into state
      setMessages(prev => [...prev, assistantPlaceholder]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: accumulatedText,
            };
          }
          return updated;
        });
      }

      setIsStreaming(false);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        console.error('Chat error:', err);
        setErrorState({
          type: 'network',
          message: "Connection lost while communicating with the agent. Please try again.",
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
    }
  };

  const handleResetChat = () => {
    if (isStreaming) handleStopGeneration();
    setMessages(INITIAL_MESSAGES);
    setErrorState(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="agent-chat-terminal"
      style={{
        width: '100%',
        maxWidth: 960,
        margin: '0 auto',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 16,
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--glass-shadow)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Terminal Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.4rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(234, 88, 12, 0.04)',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Ask About Me
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '2px 8px',
                  borderRadius: 100,
                  background: 'rgba(234, 88, 12, 0.12)',
                  color: 'var(--accent-primary)',
                  border: '1px solid rgba(234, 88, 12, 0.25)',
                }}
              >
                AI Agent v1.0
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 8px #22c55e',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Live · Groq LLM
            </span>
          </div>

          {/* Reset chat button */}
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
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Clear
          </button>
        </div>
      </div>

      {/* ── Messages Feed ── */}
      <div
        ref={messagesContainerRef}
        style={{
          height: 'clamp(320px, 45vh, 460px)',
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
              transition={{ duration: 0.25 }}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                width: '100%',
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  padding: '0.85rem 1.15rem',
                  borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: isUser
                    ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                    : 'var(--bg-secondary)',
                  color: isUser ? '#FFFFFF' : 'var(--text-primary)',
                  boxShadow: isUser
                    ? '0 3px 12px var(--accent-glow)'
                    : '0 2px 8px rgba(0,0,0,0.04)',
                  border: isUser ? 'none' : '1px solid var(--border-subtle)',
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 6,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'var(--accent-primary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <span>⚡ Assistant</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{msg.timestamp}</span>
                  </div>
                )}

                <div
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content}
                  {isStreaming && idx === messages.length - 1 && !isUser && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 7,
                        height: 14,
                        background: 'var(--accent-primary)',
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

        {/* Loading typing indicator while waiting for first token */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', justifyContent: 'flex-start' }}
          >
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '14px 14px 14px 2px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginRight: 4 }}>
                Consulting Pratham's knowledge base
              </span>
              <span className="typing-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-primary)', animation: 'bounce 1s infinite 0s' }} />
              <span className="typing-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-primary)', animation: 'bounce 1s infinite 0.2s' }} />
              <span className="typing-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-primary)', animation: 'bounce 1s infinite 0.4s' }} />
            </div>
          </motion.div>
        )}

        {/* Edge State: Rate Limit Alert Banner */}
        {errorState?.type === 'rate_limit' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '1rem',
              borderRadius: 10,
              background: 'rgba(234, 88, 12, 0.08)',
              border: '1px solid var(--accent-primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.85rem' }}>
              <span>⚠️</span>
              <span>Question Limit Reached</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: 0 }}>
              {errorState.message}
            </p>
            <div>
              <a
                href="#contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--accent-primary)',
                  textDecoration: 'underline',
                }}
              >
                Jump to Contact Section to send Pratham an email or connect directly →
              </a>
            </div>
          </motion.div>
        )}

        {/* Edge State: Network / API Failure Banner */}
        {errorState?.type === 'network' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <span>{errorState.message}</span>
            <button
              type="button"
              onClick={() => handleSend(messages[messages.length - 1]?.content)}
              style={{
                background: '#EF4444',
                color: '#fff',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested Questions Chips ── */}
      <div
        style={{
          padding: '0.6rem 1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
        }}
      >
        {SUGGESTED_QUESTIONS.map((question, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(question)}
            disabled={isLoading || isStreaming}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 100,
              padding: '5px 12px',
              fontSize: '0.74rem',
              color: 'var(--text-secondary)',
              cursor: isLoading || isStreaming ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!isLoading && !isStreaming) {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.color = 'var(--accent-primary)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {question}
          </button>
        ))}
      </div>

      {/* ── Input Controls Bar ── */}
      <div
        style={{
          padding: '0.85rem 1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(234, 88, 12, 0.02)',
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about projects, tech stack, or experience..."
            maxLength={500}
            disabled={isLoading}
            aria-label="Ask Pratham's AI Agent a question"
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: 8,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.85rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
          />

          {/* Character counter */}
          <span
            style={{
              fontSize: '0.7rem',
              color: input.length > 450 ? '#EF4444' : 'var(--text-muted)',
              minWidth: 45,
              textAlign: 'right',
            }}
          >
            {input.length}/500
          </span>

          {/* Action button: Send or Stop */}
          {isStreaming ? (
            <button
              type="button"
              onClick={handleStopGeneration}
              aria-label="Stop generation"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '0.75rem 1.2rem',
                borderRadius: 8,
                background: '#EF4444',
                color: '#fff',
                border: 'none',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
            >
              <span style={{ width: 8, height: 8, background: '#fff', display: 'inline-block' }} />
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '0.75rem 1.4rem',
                borderRadius: 8,
                background: !input.trim() || isLoading ? 'var(--border-subtle)' : 'var(--accent-primary)',
                color: !input.trim() || isLoading ? 'var(--text-muted)' : '#FFFFFF',
                border: 'none',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: !input.trim() || isLoading ? 'none' : '0 2px 10px var(--accent-glow)',
              }}
            >
              <span>Ask</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
