'use client';

import { FC, RefObject, useEffect, useRef, useState } from 'react';
import 'github-markdown-css/github-markdown-dark.css';
import { TbLoader2, TbArrowsShuffle } from 'react-icons/tb';
import { scrambleNodes, applyCaseNodes } from '@/lib/office/md/typoglycemia';
import { applyBrailleNodes } from '@/lib/office/md/braille';
import { applyMorseNodes } from '@/lib/office/md/morse';
import { applyLeetNodes } from '@/lib/office/md/leet';
import type { ConvertKind } from '@/components/office/md/molecules/ConvertToolbar';

import { type CaseKind } from '@/lib/office/md/textCase';

interface MarkdownPreviewerProps {
  html: string;
  isRendering: boolean;
  previewRef: RefObject<HTMLDivElement | null>;
  visible: boolean;
  scramble?: boolean;
  onToggleScramble?: () => void;
  convertKind?: ConvertKind;
}

const SCRAMBLE_INTERVAL_MS = 1000;

const isCaseKind = (kind: ConvertKind): kind is CaseKind =>
  kind === 'upper' ||
  kind === 'lower' ||
  kind === 'title' ||
  kind === 'camel' ||
  kind === 'snake' ||
  kind === 'kebab';

export const MarkdownPreviewer: FC<MarkdownPreviewerProps> = ({
  html,
  isRendering,
  previewRef,
  visible,
  scramble = false,
  onToggleScramble,
  convertKind = null,
}) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!scramble) return;
    const id = setInterval(() => setTick((t) => t + 1), SCRAMBLE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [scramble]);

  useEffect(() => {
    if (!contentRef.current) return;
    if (scramble) {
      scrambleNodes(contentRef.current);
    } else if (convertKind) {
      if (isCaseKind(convertKind)) {
        applyCaseNodes(contentRef.current, convertKind);
      } else if (convertKind === 'braille') {
        applyBrailleNodes(contentRef.current);
      } else if (convertKind === 'morse') {
        applyMorseNodes(contentRef.current);
      } else if (convertKind === 'leet') {
        applyLeetNodes(contentRef.current);
      }
    }
  }, [tick, scramble, convertKind, html]);

  return (
    <div
      ref={previewRef}
      className={`markdown-body flex h-full min-h-0 flex-col ${visible ? '' : 'hidden'}`}
      aria-label='Markdown preview'>
      {isRendering ? (
        <div className='text-base-content/40 flex h-full items-center justify-center gap-2'>
          <TbLoader2 className='animate-spin' size={20} />
          <span className='text-sm'>Rendering…</span>
        </div>
      ) : (
        <div ref={contentRef} className='min-h-0 flex-1 overflow-y-auto p-6'>
          <div dangerouslySetInnerHTML={{ __html: html }} data-testid='markdown-preview' />
        </div>
      )}
      {onToggleScramble && (
        <div className='border-base-content/10 flex justify-end border-t px-4 py-1.5'>
          <button
            className={`btn btn-xs gap-1 ${scramble ? 'btn-primary' : 'btn-ghost'}`}
            onClick={onToggleScramble}
            aria-label={scramble ? 'Disable typoglycemia' : 'Enable typoglycemia'}>
            <TbArrowsShuffle size={13} />
            Typoglycemia
          </button>
        </div>
      )}
    </div>
  );
};
