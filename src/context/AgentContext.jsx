import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export const VALID_MOODS = ['normal', 'frustrated', 'sad', 'sarcasm', 'shock', 'weird'];

export const MOOD_IMAGES = {
  normal: '/agent/normal.webp',
  frustrated: '/agent/frustrated.webp',
  sad: '/agent/sad.webp',
  sarcasm: '/agent/sarcasm.webp',
  shock: '/agent/shock.webp',
  weird: '/agent/weird.webp',
};

export const MOOD_AVATARS = {
  normal: '/agent/avatar/normal.webp',
  frustrated: '/agent/avatar/frustrated.webp',
  sad: '/agent/avatar/sad.webp',
  sarcasm: '/agent/avatar/sarcasm.webp',
  shock: '/agent/avatar/shock.webp',
  weird: '/agent/avatar/weird.webp',
};

const AgentContext = createContext({
  mood: 'normal',
  setMood: () => {},
  isChatOpen: false,
  openChat: () => {},
  closeChat: () => {},
  toggleChat: () => {},
  currentImage: MOOD_IMAGES.normal,
  currentAvatar: MOOD_AVATARS.normal,
  pendingPrompt: null,
  setPendingPrompt: () => {},
  openChatWithPrompt: () => {},
});

export function AgentProvider({ children }) {
  const [mood, setMoodState] = useState('normal');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const timeoutRef = useRef(null);

  // Preload all 6 expression images and avatars on mount to guarantee zero flicker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    Object.values(MOOD_IMAGES).forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });

    Object.values(MOOD_AVATARS).forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  const setMood = useCallback((newMood, durationMs = 4000) => {
    const valid = VALID_MOODS.includes(newMood) ? newMood : 'normal';

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setMoodState(valid);

    if (valid !== 'normal' && durationMs > 0) {
      timeoutRef.current = setTimeout(() => {
        setMoodState('normal');
        timeoutRef.current = null;
      }, durationMs);
    }
  }, []);

  const openChat = useCallback(() => setIsChatOpen(true), []);
  const closeChat = useCallback(() => setIsChatOpen(false), []);
  const toggleChat = useCallback(() => setIsChatOpen((prev) => !prev), []);
  const openChatWithPrompt = useCallback((prompt) => {
    setPendingPrompt(prompt);
    setIsChatOpen(true);
  }, []);

  const value = {
    mood,
    setMood,
    isChatOpen,
    openChat,
    closeChat,
    toggleChat,
    currentImage: MOOD_IMAGES[mood] || MOOD_IMAGES.normal,
    currentAvatar: MOOD_AVATARS[mood] || MOOD_AVATARS.normal,
    pendingPrompt,
    setPendingPrompt,
    openChatWithPrompt,
  };

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
}
