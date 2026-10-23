'use client';

import { type FC, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FiLoader } from 'react-icons/fi';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { SlidePreview } from '@/components/office/keynotes/organisms/SlidePreview';

const OPTIONS = [
  { perPage: 1, cols: 1, width: 896 },
  { perPage: 2, cols: 2, width: 620 },
  { perPage: 3, cols: 3, width: 440 },
  { perPage: 6, cols: 3, width: 430 },
] as const;

const HandoutsPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentDeck, openDeck, closeDeck } = useDeck();
  const [perPage, setPerPage] = useState<(typeof OPTIONS)[number]>(OPTIONS[0]);

  useEffect(() => {
    if (id) void openDeck(id);
    return () => closeDeck();
  }, [id, openDeck, closeDeck]);

  if (!currentDeck) {
    return (
      <div className='flex h-screen flex-col items-center justify-center gap-2 text-sm opacity-50'>
        <FiLoader className='size-5 animate-spin' />
        Preparing handouts…
      </div>
    );
  }

  const slides = currentDeck.slides.filter((s) => !s.hidden);
  const chunks: Array<typeof slides> = [];
  for (let i = 0; i < slides.length; i += perPage.perPage) {
    chunks.push(slides.slice(i, i + perPage.perPage));
  }

  return (
    <div className='print-area mx-auto max-w-5xl p-8'>
      <header className='no-print mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold'>{currentDeck.title}</h1>
          <p className='text-sm opacity-60'>{slides.length} slides · handouts</p>
        </div>
        <div className='flex items-center gap-2'>
          <div className='bg-base-300/60 flex items-center gap-1 rounded-lg p-0.5'>
            {OPTIONS.map((o) => (
              <button
                key={o.perPage}
                type='button'
                onClick={() => setPerPage(o)}
                className={`btn btn-ghost btn-xs ${perPage.perPage === o.perPage ? 'bg-base-100 shadow' : ''}`}
                title={`${o.perPage} slide${o.perPage === 1 ? '' : 's'} per page`}>
                {o.perPage}
              </button>
            ))}
          </div>
          <button type='button' className='btn btn-outline btn-sm' onClick={() => window.print()}>
            Print handouts
          </button>
        </div>
      </header>

      {chunks.map((chunk, ci) => (
        <section
          key={ci}
          className='border-base-300 grid break-after-page gap-6 border p-6 last:break-after-auto'
          style={{ gridTemplateColumns: `repeat(${perPage.cols}, 1fr)` }}>
          {chunk.map((s, i) => (
            <figure key={s.id} className='flex flex-col items-center gap-1.5'>
              <SlidePreview
                deck={currentDeck}
                slide={s}
                width={perPage.width}
                slideNumber={ci * perPage.perPage + i + 1}
                className='shadow'
              />
              {s.notes && (
                <figcaption className='w-full px-2 text-[10px] whitespace-pre-wrap opacity-60'>
                  {s.notes}
                </figcaption>
              )}
            </figure>
          ))}
        </section>
      ))}
    </div>
  );
};

export default HandoutsPage;
