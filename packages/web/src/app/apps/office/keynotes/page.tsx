'use client';

import { type FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiFileText, FiGrid, FiLoader, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { formatDate } from '@/lib/office/keynotes/format';
import { newDeck } from '@/lib/office/keynotes/deckFactory';
import { DeckThumb } from '@/components/office/keynotes/molecules/DeckThumb';
import { ImportMenu } from '@/components/office/keynotes/molecules/ImportMenu';

const HomePage: FC = () => {
  const { decks, loadingDecks, createDeck, createDeckFromTemplate, deleteDeck } = useDeck();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const handleNew = async () => {
    setBusy('new');
    try {
      const id = await createDeck(newDeck());
      router.push(`/editor/${id}`);
    } finally {
      setBusy(null);
    }
  };

  const handleTemplate = async (templateId: string) => {
    setBusy(templateId);
    try {
      const id = await createDeckFromTemplate(templateId);
      router.push(`/editor/${id}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className='mx-auto max-w-6xl px-6 py-10'>
      <header className='mb-8 flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Keynotes</h1>
          <p className='mt-1 text-sm opacity-60'>Presentations that move like a live show.</p>
        </div>
        <div className='flex gap-2'>
          <ImportMenu />
          <button
            type='button'
            onClick={handleNew}
            disabled={busy !== null}
            className='btn btn-primary gap-1.5'>
            <FiPlus className='size-4' /> New deck
          </button>
        </div>
      </header>

      <section className='mb-8'>
        <h2 className='mb-3 text-sm font-semibold tracking-wide uppercase opacity-60'>
          Start from a template
        </h2>
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6'>
          {[
            { id: 'pitch', label: 'Pitch' },
            { id: 'report', label: 'Report' },
            { id: 'lesson', label: 'Lesson' },
            { id: 'wedding', label: 'Wedding' },
            { id: 'portfolio', label: 'Portfolio' },
            { id: 'tech-talk', label: 'Tech talk' },
          ].map((t) => (
            <button
              key={t.id}
              type='button'
              disabled={busy !== null}
              onClick={() => handleTemplate(t.id)}
              className='group border-base-300 bg-base-200 hover:border-primary/60 hover:bg-base-300/60 flex h-20 flex-col items-center justify-center gap-2 rounded-2xl border transition'>
              {busy === t.id ? (
                <FiLoader className='size-5 animate-spin' />
              ) : (
                <>
                  <FiGrid className='text-primary size-6' />
                  <span className='text-xs'>{t.label}</span>
                </>
              )}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className='mb-3 text-sm font-semibold tracking-wide uppercase opacity-60'>
          Recent decks
        </h2>
        {loadingDecks ? (
          <div
            className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'
            aria-label='Loading decks'
            aria-busy='true'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='border-base-300 bg-base-200 flex h-52 animate-pulse flex-col gap-3 rounded-2xl border p-4'>
                <div className='bg-base-300/60 h-28 rounded-lg' />
                <div className='bg-base-300/60 h-4 w-2/3 rounded' />
                <div className='bg-base-300/60 h-3 w-1/2 rounded' />
              </div>
            ))}
          </div>
        ) : decks.length === 0 ? (
          <div className='border-base-300 flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16 text-sm opacity-60'>
            <FiFileText className='size-8' />
            No decks yet. Create your first presentation.
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {decks.map((d) => (
              <div
                key={d.id}
                className='group border-base-300 bg-base-200 hover:border-primary/60 relative rounded-2xl border p-4 transition'>
                <Link href={`/editor/${d.id}`} className='block'>
                  <DeckThumb deckId={d.id} width={264} className='mb-3' />
                  <div className='truncate text-sm font-medium'>{d.title || 'Untitled deck'}</div>
                  <div className='mt-0.5 text-xs opacity-50'>
                    {d.slideCount} slide{d.slideCount === 1 ? '' : 's'} · updated{' '}
                    {formatDate(d.updatedAt)}
                  </div>
                </Link>
                <button
                  type='button'
                  onClick={() => {
                    if (confirm(`Delete "${d.title}"? This cannot be undone.`)) deleteDeck(d.id);
                  }}
                  className='text-error/70 hover:bg-error/10 hover:text-error absolute top-2 right-2 hidden rounded-lg p-1.5 group-hover:block'
                  title='Delete deck'>
                  <FiTrash2 className='size-4' />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
