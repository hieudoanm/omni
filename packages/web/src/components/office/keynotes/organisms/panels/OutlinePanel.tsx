'use client';

import { type FC } from 'react';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';

export const OutlinePanel: FC = () => {
  const { currentDeck, activeSlideId, setActiveSlide } = useDeck();
  if (!currentDeck) return null;

  const textOf = (slideId: string): string => {
    const slide = currentDeck.slides.find((s) => s.id === slideId);
    if (!slide) return '';
    const texts = slide.objects
      .filter((o) => (o.kind === 'text' && o.text) || (o.kind === 'shape' && o.text))
      .map((o) => (o.kind === 'text' || o.kind === 'shape' ? o.text : ''))
      .join('\n');
    return texts || '(no text)';
  };

  return (
    <div className='no-scrollbar min-h-0 flex-1 overflow-y-auto p-2'>
      {currentDeck.slides.map((s, i) => (
        <button
          key={s.id}
          type='button'
          onClick={() => setActiveSlide(s.id)}
          className={`block w-full rounded-lg px-3 py-2 text-left text-xs transition ${
            activeSlideId === s.id ? 'bg-primary/15 text-primary' : 'hover:bg-base-300/50'
          }`}>
          <div className='font-semibold opacity-70'>
            {i + 1}. {s.name}
          </div>
          <pre className='mt-0.5 line-clamp-3 text-[11px] whitespace-pre-wrap opacity-60'>
            {textOf(s.id)}
          </pre>
        </button>
      ))}
    </div>
  );
};
