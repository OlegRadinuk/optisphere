'use client';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type State = 'idle' | 'covering' | 'covered' | 'revealing';

interface TransitionCtx {
  navigate: (href: string) => void;
}

const Ctx = createContext<TransitionCtx>({ navigate: () => {} });

export function usePageTransition() {
  return useContext(Ctx);
}

const COVER_MS   = 280;
const HOLD_MS    = 60;
const REVEAL_MS  = 320;

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const [state, setState] = useState<State>('idle');
  const panelRef = useRef<HTMLDivElement>(null);
  const busy     = useRef(false);

  const navigate = useCallback((href: string) => {
    if (busy.current) { router.push(href); return; }
    busy.current = true;

    // 1. Cover — panel slides down over the page
    setState('covering');

    setTimeout(() => {
      // 2. Navigate while hidden
      setState('covered');
      router.push(href);

      setTimeout(() => {
        // 3. Reveal — panel slides down off screen
        setState('revealing');

        setTimeout(() => {
          setState('idle');
          busy.current = false;
        }, REVEAL_MS);
      }, HOLD_MS);
    }, COVER_MS);
  }, [router]);

  const panelStyle = (() => {
    const base: React.CSSProperties = {
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: '100dvh',
      zIndex: 9999,
      pointerEvents: 'none',
      background: '#07070f',
      willChange: 'transform',
    };
    const scanLine = '0 4px 0 0 #E82020, 0 6px 24px 0 rgba(232,32,32,0.55)';

    switch (state) {
      case 'idle':
        return { ...base, transform: 'translateY(-100%)', transition: 'none' };
      case 'covering':
        return { ...base, transform: 'translateY(0%)', transition: `transform ${COVER_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`, boxShadow: scanLine };
      case 'covered':
        return { ...base, transform: 'translateY(0%)', transition: 'none', boxShadow: scanLine };
      case 'revealing':
        return { ...base, transform: 'translateY(100%)', transition: `transform ${REVEAL_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`, boxShadow: scanLine };
    }
  })();

  return (
    <Ctx.Provider value={{ navigate }}>
      {children}
      {/* Scan-line overlay */}
      <div ref={panelRef} style={panelStyle} aria-hidden>
        {/* Terminal text during transition */}
        {(state === 'covering' || state === 'covered') && (
          <div style={{
            position: 'absolute',
            bottom: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            font: "500 11px/1 'JetBrains Mono',monospace",
            color: 'rgba(232,32,32,0.7)',
            letterSpacing: '.15em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            ◆ OPTISPHERE · LOADING
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}
