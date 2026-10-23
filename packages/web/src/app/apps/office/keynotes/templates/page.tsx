'use client';

import { type FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiLoader, FiPlus } from 'react-icons/fi';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { TEMPLATES } from '@/data/office/keynotes/templates';
import { themeById } from '@/data/office/keynotes/themes';

const TemplatesPage: FC = () => {
  const router = useRouter();
  const { createDeckFromTemplate } = useDeck();
  const [busy, setBusy] = useState<string | null>(null);

  const create = async (id: string) => {
    setBusy(id);
    try {
      const deckId = await createDeckFromTemplate(id);
      router.push(`/editor/${deckId}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className='mx-auto max-w-6xl px-6 py-10'>
      <button
        type='button'
        onClick={() => router.back()}
        className='mb-6 flex items-center gap-1.5 text-sm opacity-60 hover:opacity-100'>
        <FiArrowLeft /> Back
      </button>
      <h1 className='mb-1 text-3xl font-bold tracking-tight'>Templates</h1>
      <p className='mb-8 text-sm opacity-60'>Start from a pre-built template and make it yours.</p>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {TEMPLATES.map((t) => {
          const theme = themeById(t.themeId);
          return (
            <div
              key={t.id}
              className='group border-base-300 bg-base-200 hover:border-primary/60 flex flex-col rounded-2xl border p-5 transition'>
              <div
                className='mb-4 flex h-32 flex-col justify-end rounded-xl p-3'
                style={{ backgroundColor: theme.colors.background }}>
                <span className='text-sm font-semibold' style={{ color: theme.colors.text }}>
                  {t.name}
                </span>
                <span
                  className='mt-0.5 h-1.5 w-16 rounded-full'
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <span
                  className='mt-2 h-1 w-24 rounded-full opacity-30'
                  style={{ backgroundColor: theme.colors.muted }}
                />
              </div>
              <div className='text-sm font-medium'>{t.name}</div>
              <p className='mt-0.5 flex-1 text-xs opacity-50'>{t.description}</p>
              <div className='mt-3 flex items-center justify-between'>
                <span className='text-xs opacity-40'>{t.slides.length} slides</span>
                <button
                  type='button'
                  disabled={busy !== null}
                  onClick={() => create(t.id)}
                  className='btn btn-primary btn-sm gap-1.5'>
                  {busy === t.id ? (
                    <FiLoader className='size-3.5 animate-spin' />
                  ) : (
                    <FiPlus className='size-3.5' />
                  )}
                  Use template
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TemplatesPage;
