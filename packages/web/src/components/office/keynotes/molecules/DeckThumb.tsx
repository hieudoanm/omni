'use client';

import { useEffect, useState, type FC } from 'react';
import { FiFile } from 'react-icons/fi';
import { db } from '@/lib/office/keynotes/db';
import { SlidePreview } from '@/components/office/keynotes/organisms/SlidePreview';
import type { Deck } from '@/types/keynotes/deck';

export const DeckThumb: FC<{
  deckId: string;
  width?: number;
  className?: string;
}> = ({ deckId, width = 264, className }) => {
  const [deck, setDeck] = useState<Deck | null>(null);

  useEffect(() => {
    let alive = true;
    db.decks.get(deckId).then((d) => {
      if (alive) setDeck(d ?? null);
    });
    return () => {
      alive = false;
    };
  }, [deckId]);

  const fallbackHeight = Math.round((width * 9) / 16);

  if (!deck) {
    return (
      <div
        className={`bg-base-300/40 flex items-center justify-center ${className ?? ''}`}
        style={{ width, height: fallbackHeight }}>
        <FiFile className='text-primary/60 size-8' />
      </div>
    );
  }

  const first = deck.slides.find((s) => !s.hidden) ?? deck.slides[0];
  if (!first) {
    return (
      <div
        className={`bg-base-300/40 flex items-center justify-center ${className ?? ''}`}
        style={{ width, height: fallbackHeight }}>
        <FiFile className='text-primary/60 size-8' />
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-xl ${className ?? ''}`}
      style={{ width, height: deck.height * (width / deck.width) }}>
      <SlidePreview deck={deck} slide={first} width={width} />
    </div>
  );
};
