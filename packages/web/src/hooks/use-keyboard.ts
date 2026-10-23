'use client';

import { useEffect, useRef } from 'react';
import { log } from '@/utils/log';

export type KeyHandler = (event: KeyboardEvent) => void;

export type KeyMap = Record<string, KeyHandler>;

export const useKeyboard = (keyMap: KeyMap) => {
  const keyMapRef = useRef(keyMap);

  useEffect(() => {
    keyMapRef.current = keyMap;
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      log.trace(`Key pressed: ${event.key}`);
      const handler = keyMapRef.current[event.key];
      if (handler) {
        log.debug(`Handling key: ${event.key}`);
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};

export default useKeyboard;
