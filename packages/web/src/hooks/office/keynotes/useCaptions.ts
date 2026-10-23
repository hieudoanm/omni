'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionEventLike {
  results: ArrayLike<{
    isFinal: boolean;
    [index: number]: { transcript: string };
  }>;
}

interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
}

type RecognitionCtor = new () => RecognitionLike;

const getCtor = (): RecognitionCtor | null => {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export const useCaptions = () => {
  const recRef = useRef<RecognitionLike | null>(null);
  const restartRef = useRef(false);
  const [supported] = useState(() => getCtor() !== null);
  const [listening, setListening] = useState(false);
  const [final, setFinal] = useState('');
  const [interim, setInterim] = useState('');

  useEffect(() => {
    const Ctor = getCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = navigator.language || 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let finals = '';
      let live = '';
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        const text = r[0]?.transcript ?? '';
        if (r.isFinal) finals += text;
        else live += text;
      }
      if (finals) setFinal((prev) => prev + finals);
      setInterim(live);
    };
    rec.onerror = () => {
      restartRef.current = false;
      setListening(false);
    };
    rec.onend = () => {
      if (restartRef.current) {
        try {
          rec.start();
        } catch {
          restartRef.current = false;
          setListening(false);
        }
      } else {
        setListening(false);
      }
    };
    recRef.current = rec;
    return () => {
      restartRef.current = false;
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
    };
  }, []);

  const start = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    restartRef.current = true;
    setFinal('');
    setInterim('');
    try {
      rec.start();
      setListening(true);
    } catch {
      restartRef.current = false;
    }
  }, []);

  const stop = useCallback(() => {
    restartRef.current = false;
    const rec = recRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        /* not running */
      }
    }
    setListening(false);
  }, []);

  return {
    supported,
    listening,
    text: `${final}${interim}`.trim(),
    start,
    stop,
    toggle: listening ? stop : start,
  };
};
