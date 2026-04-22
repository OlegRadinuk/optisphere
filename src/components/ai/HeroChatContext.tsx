'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface HeroChatContextValue {
  heroChatOpen: boolean;
  openHeroChat: () => void;
  closeHeroChat: () => void;
  // Shared conversation
  sharedMessages: ChatMessage[];
  setSharedMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  sharedSessionId: string;
}

const HeroChatContext = createContext<HeroChatContextValue | null>(null);

function makeSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function HeroChatProvider({ children }: { children: React.ReactNode }) {
  const [heroChatOpen, setHeroChatOpen] = useState(false);
  const [sharedMessages, setSharedMessages] = useState<ChatMessage[]>([]);
  const sessionIdRef = useRef(makeSessionId());

  const openHeroChat = useCallback(() => setHeroChatOpen(true), []);
  const closeHeroChat = useCallback(() => setHeroChatOpen(false), []);

  const value = useMemo<HeroChatContextValue>(
    () => ({
      heroChatOpen,
      openHeroChat,
      closeHeroChat,
      sharedMessages,
      setSharedMessages,
      sharedSessionId: sessionIdRef.current,
    }),
    [heroChatOpen, openHeroChat, closeHeroChat, sharedMessages],
  );

  return <HeroChatContext.Provider value={value}>{children}</HeroChatContext.Provider>;
}

export function useHeroChat(): HeroChatContextValue {
  const ctx = useContext(HeroChatContext);
  if (!ctx) {
    // Soft fallback — so components can be used outside provider (for SSR safety)
    return {
      heroChatOpen: false,
      openHeroChat: () => {},
      closeHeroChat: () => {},
      sharedMessages: [],
      setSharedMessages: () => {},
      sharedSessionId: '',
    };
  }
  return ctx;
}
