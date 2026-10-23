'use client';

import { MarkdownPreviewer } from '@/components/office/md/organisms/MarkdownPreviewer';
import { CHEAT_SHEET } from '@/data/office/md/cheat-sheet';
import { useCodeMirror } from '@/hooks/office/md/useCodeMirror';
import { useMarkdownRender } from '@/hooks/office/md/useMarkdownRender';
import type { Note } from '@/lib/office/md/types';
import { FC, useCallback, useRef, useState } from 'react';

export const LiteMarkdownApp: FC = () => {
  const [note, setNote] = useState<Note>({
    id: 'lite',
    title: 'Lite',
    content: CHEAT_SHEET,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const editorRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const handleDocChange = useCallback((content: string): void => {
    setNote((prev) => ({ ...prev, content, updatedAt: Date.now() }));
  }, []);

  useCodeMirror({
    containerRef: editorRef,
    initialDoc: note.content,
    onChange: handleDocChange,
  });

  const { html, isRendering } = useMarkdownRender(note.content);

  return (
    <div className='flex h-full flex-col'>
      <div className='flex h-full min-h-0 flex-1'>
        <section className='min-w-0 flex-1'>
          <div ref={editorRef} className='h-full overflow-hidden' data-testid='editor' />
        </section>
        <section className='min-w-0 flex-1'>
          <MarkdownPreviewer
            html={html}
            isRendering={isRendering}
            previewRef={previewRef}
            visible
          />
        </section>
      </div>
    </div>
  );
};

LiteMarkdownApp.displayName = 'LiteMarkdownApp';
