'use client';

import { type FC, useState } from 'react';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { renderMarkdown } from '@/lib/office/keynotes/markdown';

export const NotesPanel: FC = () => {
  const { activeSlide, setSlideNotes } = useDeck();
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  if (!activeSlide) return null;

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-2 p-3'>
      <div className='flex items-center justify-between'>
        <div className='text-xs font-semibold tracking-wide uppercase opacity-70'>
          Speaker notes
        </div>
        <div className='flex gap-1'>
          {(['edit', 'preview'] as const).map((m) => (
            <button
              key={m}
              type='button'
              onClick={() => setMode(m)}
              className={`btn btn-xs ${mode === m ? 'btn-primary' : 'btn-ghost'}`}>
              {m === 'edit' ? 'Edit' : 'Preview'}
            </button>
          ))}
        </div>
      </div>
      {mode === 'edit' ? (
        <textarea
          value={activeSlide.notes}
          onChange={(e) => setSlideNotes(e.target.value)}
          placeholder='Notes for this slide…'
          className='textarea textarea-bordered min-h-0 flex-1 resize-none text-sm'
        />
      ) : (
        <div className='no-scrollbar border-base-300 bg-base-100 min-h-0 flex-1 overflow-y-auto rounded-lg border p-3'>
          {activeSlide.notes.trim() ? (
            renderMarkdown(activeSlide.notes)
          ) : (
            <p className='text-sm opacity-40'>No notes yet.</p>
          )}
        </div>
      )}
      <p className='text-[11px] opacity-40'>
        Markdown supported. Notes are visible only in presenter view and the print/PDF export.
      </p>
    </div>
  );
};
