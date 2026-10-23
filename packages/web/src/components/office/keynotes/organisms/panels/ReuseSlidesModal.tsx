'use client';

import { useEffect, useState, type FC } from 'react';
import { FiX, FiChevronRight } from 'react-icons/fi';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { db } from '@/lib/office/keynotes/db';
import type { Deck, Slide } from '@/types/keynotes/deck';
import { SlidePreview } from '@/components/office/keynotes/organisms/SlidePreview';
import { cloneSlideForInsert, insertSlidesAfter, appendSlides } from '@/lib/office/keynotes/reuse';

export const ReuseSlidesModal: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentDeck, activeSlideId, mutate } = useDeck();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void db.decks.getAll().then((all) => {
      if (mounted && currentDeck) setDecks(all.filter((d) => d.id !== currentDeck.id));
    });
    return () => {
      mounted = false;
    };
  }, [currentDeck]);

  if (!currentDeck) return null;

  const insert = (slide: Slide) => {
    const clone = cloneSlideForInsert(slide);
    mutate((deck) =>
      activeSlideId ? insertSlidesAfter(deck, activeSlideId, [clone]) : appendSlides(deck, [clone]),
    );
    onClose();
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'
      onClick={onClose}>
      <div
        className='border-base-300 bg-base-100 flex max-h-[80vh] w-[640px] flex-col rounded-2xl border p-4'
        role='dialog'
        aria-modal='true'
        aria-label='Reuse slides from other decks'
        onClick={(e) => e.stopPropagation()}>
        <div className='mb-3 flex items-center justify-between'>
          <div className='text-sm font-semibold'>Reuse slides from other decks</div>
          <button
            type='button'
            aria-label='Close'
            onClick={onClose}
            className='opacity-60 hover:opacity-100'>
            <FiX className='size-4' />
          </button>
        </div>

        <div className='no-scrollbar min-h-0 flex-1 overflow-y-auto'>
          {decks.length === 0 && (
            <p className='py-8 text-center text-xs opacity-50'>
              No other decks found. Create another deck first.
            </p>
          )}
          {decks.map((deck) => {
            const open = expanded === deck.id;
            return (
              <div key={deck.id} className='border-base-300 mb-2 rounded-xl border'>
                <button
                  type='button'
                  className='flex w-full items-center gap-2 px-3 py-2 text-left'
                  onClick={() => setExpanded(open ? null : deck.id)}>
                  <FiChevronRight
                    className={`size-4 transition-transform ${open ? 'rotate-90' : ''}`}
                  />
                  <span className='flex-1 truncate text-sm'>{deck.title}</span>
                  <span className='text-xs opacity-50'>{deck.slides.length} slides</span>
                </button>
                {open && (
                  <div className='flex flex-wrap gap-2 px-3 pb-3'>
                    {deck.slides.length === 0 && (
                      <p className='py-2 text-xs opacity-40'>This deck has no slides.</p>
                    )}
                    {deck.slides.map((slide) => (
                      <button
                        key={slide.id}
                        type='button'
                        onClick={() => insert(slide)}
                        className='border-base-300 hover:border-primary overflow-hidden rounded-lg border transition'
                        title={`Insert "${slide.name}"`}>
                        <SlidePreview deck={deck} slide={slide} width={150} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
