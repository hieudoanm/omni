'use client';

import { type FC, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FiDownload, FiLoader } from 'react-icons/fi';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { SlidePreview } from '@/components/office/keynotes/organisms/SlidePreview';
import { exportDeckJson, exportHtmlFile, exportPptxMock } from '@/lib/office/keynotes/exporters';

const PrintPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentDeck, openDeck, closeDeck } = useDeck();

  useEffect(() => {
    if (id) void openDeck(id);
    return () => closeDeck();
  }, [id, openDeck, closeDeck]);

  if (!currentDeck) {
    return (
      <div className='flex h-screen flex-col items-center justify-center gap-2 text-sm opacity-50'>
        <FiLoader className='size-5 animate-spin' />
        Preparing export…
      </div>
    );
  }

  const slides = currentDeck.slides.filter((s) => !s.hidden);

  return (
    <div className='print-area mx-auto max-w-4xl p-8'>
      <header className='no-print mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold'>{currentDeck.title}</h1>
          <p className='text-sm opacity-60'>{slides.length} slides · 16:9</p>
        </div>
        <div className='flex gap-2'>
          <button
            type='button'
            className='btn btn-outline btn-sm gap-1.5'
            onClick={() => window.print()}>
            <FiDownload className='size-4' /> Print / Save as PDF
          </button>
          <button
            type='button'
            className='btn btn-primary btn-sm gap-1.5'
            onClick={() => {
              exportDeckJson(currentDeck);
              exportPptxMock(currentDeck);
              exportHtmlFile(currentDeck);
            }}>
            <FiDownload className='size-4' /> Export
          </button>
        </div>
      </header>

      <div className='flex flex-col items-center gap-10'>
        {slides.map((s, i) => (
          <section key={s.id} className='flex break-after-page flex-col items-center gap-2'>
            <SlidePreview
              deck={currentDeck}
              slide={s}
              width={896}
              slideNumber={i + 1}
              className='shadow-lg'
            />
            {s.notes && (
              <p className='w-full px-4 text-xs whitespace-pre-wrap opacity-60'>{s.notes}</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default PrintPage;
