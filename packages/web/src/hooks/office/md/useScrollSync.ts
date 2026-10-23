'use client';

import { useEffect } from 'react';
import type { RefObject } from 'react';

const syncScroll = (from: HTMLElement, to: HTMLElement): void => {
  const fromRange = from.scrollHeight - from.clientHeight;
  const toRange = to.scrollHeight - to.clientHeight;
  if (fromRange <= 0 || toRange <= 0) return;
  to.scrollTop = (from.scrollTop / fromRange) * toRange;
};

export const useScrollSync = (
  editor: HTMLElement | null,
  previewRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
): void => {
  useEffect(() => {
    const preview = previewRef.current;
    if (!enabled || !editor || !preview) return;

    let lock = false;
    const run = (from: HTMLElement, to: HTMLElement): void => {
      if (lock) return;
      lock = true;
      syncScroll(from, to);
      requestAnimationFrame(() => {
        lock = false;
      });
    };

    const onEditorScroll = (): void => run(editor, preview);
    const onPreviewScroll = (): void => run(preview, editor);

    editor.addEventListener('scroll', onEditorScroll, { passive: true });
    preview.addEventListener('scroll', onPreviewScroll, { passive: true });

    return () => {
      editor.removeEventListener('scroll', onEditorScroll);
      preview.removeEventListener('scroll', onPreviewScroll);
    };
  }, [editor, previewRef, enabled]);
};
