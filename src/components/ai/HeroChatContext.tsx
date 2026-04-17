'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface HeroChatContextValue {
  heroChatOpen: boolean;
  openHeroChat: () => void;
  closeHeroChat: () => void;
}

const HeroChatContext = createContext<HeroChatContextValue | null>(null);

export function HeroChatProvider({ children }: { children: React.ReactNode }) {
  const [heroChatOpen, setHeroChatOpen] = useState(false);

  const openHeroChat = useCallback(() => setHeroChatOpen(true), []);
  const closeHeroChat = useCallback(() => setHeroChatOpen(false), []);

  const value = useMemo<HeroChatContextValue>(
    () => ({ heroChatOpen, openHeroChat, closeHeroChat }),
    [heroChatOpen, openHeroChat, closeHeroChat],
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
    };
  }
  return ctx;
}
