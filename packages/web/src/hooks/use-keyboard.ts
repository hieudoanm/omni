'use client';

import { useEffect } from 'react';
import { log } from '@/utils/log';

export type KeyHandler = (event: KeyboardEvent) => void;

export type KeyMap = Record<string, KeyHandler>;

export const useKeyboard = (keyMap: KeyMap) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      log.trace(`Key pressed: ${event.key}`);
      const handler = keyMap[event.key];
      if (handler) {
        log.debug(`Handling key: ${event.key}`);
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [keyMap]);
};

export default useKeyboard;
