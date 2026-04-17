'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Web Speech API types ────────────────────────────────────────────────────

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((ev: Event) => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface UseVoiceReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  interimTranscript: string;
}

export function useVoice(onResult: (text: string) => void): UseVoiceReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const langTriedFallbackRef = useRef(false);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    // SSR-safe client-only feature detection.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSupported(Boolean(getRecognitionCtor()));

    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        /* noop */
      }
      recognitionRef.current = null;
    };
  }, []);

  const buildRecognition = useCallback((lang: string): SpeechRecognitionLike | null => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    return rec;
  }, []);

  const startListening = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    // Stop any previous session
    try {
      recognitionRef.current?.abort();
    } catch {
      /* noop */
    }

    langTriedFallbackRef.current = false;

    const attachHandlers = (rec: SpeechRecognitionLike, lang: string) => {
      let finalText = '';

      rec.onresult = (ev: SpeechRecognitionEvent) => {
        let interim = '';
        for (let i = ev.resultIndex; i < ev.results.length; i += 1) {
          const result = ev.results[i];
          const transcript = result[0]?.transcript ?? '';
          if (result.isFinal) {
            finalText += transcript;
          } else {
            interim += transcript;
          }
        }
        setInterimTranscript(interim);
        if (finalText.trim()) {
          const toSend = finalText.trim();
          finalText = '';
          setInterimTranscript('');
          onResultRef.current(toSend);
        }
      };

      rec.onerror = (ev: SpeechRecognitionErrorEvent) => {
        // Language fallback — try once with en-US
        if (
          (ev.error === 'language-not-supported' || ev.error === 'bad-grammar') &&
          !langTriedFallbackRef.current &&
          lang !== 'en-US'
        ) {
          langTriedFallbackRef.current = true;
          try {
            rec.abort();
          } catch {
            /* noop */
          }
          const fallback = buildRecognition('en-US');
          if (fallback) {
            recognitionRef.current = fallback;
            attachHandlers(fallback, 'en-US');
            try {
              fallback.start();
            } catch {
              setIsListening(false);
            }
          }
          return;
        }
        setIsListening(false);
        setInterimTranscript('');
      };

      rec.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };
    };

    const rec = buildRecognition('ru-RU');
    if (!rec) return;
    recognitionRef.current = rec;
    attachHandlers(rec, 'ru-RU');
    try {
      rec.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  }, [buildRecognition]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* noop */
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  return { isListening, isSupported, startListening, stopListening, interimTranscript };
}
