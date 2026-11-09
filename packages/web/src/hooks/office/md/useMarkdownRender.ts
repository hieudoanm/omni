'use client';

import { useEffect, useState } from 'react';
import { renderMarkdown } from '@/lib/office/md/markdown';

export interface UseMarkdownRenderReturn {
  html: string;
  isRendering: boolean;
}

export const useMarkdownRender = (content: string): UseMarkdownRenderReturn => {
  const [html, setHtml] = useState('');
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsRendering(true);

    renderMarkdown(content).then((rendered) => {
      if (cancelled) return;
      setHtml(rendered);
      setIsRendering(false);
    });

    return () => {
      cancelled = true;
    };
  }, [content]);

  return { html, isRendering };
};
