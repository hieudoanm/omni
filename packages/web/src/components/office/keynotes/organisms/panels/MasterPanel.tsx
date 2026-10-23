'use client';

import { type FC } from 'react';
import { FiPlus, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import type { SlideMaster } from '@/types/keynotes/deck';
import { NumberInput, SelectInput } from '@/components/office/keynotes/atoms/FormControls';
import { defaultMaster, applyMasterToSlide } from '@/lib/office/keynotes/master';
import { generateId } from '@/lib/office/keynotes/id';

const KINDS = [
  { value: 'title', label: 'Title' },
  { value: 'subtitle', label: 'Subtitle' },
  { value: 'content', label: 'Content' },
  { value: 'footer', label: 'Footer' },
] as const;

export const MasterPanel: FC = () => {
  const { currentDeck, activeSlideId, mutate } = useDeck();

  if (!currentDeck) return null;
  const { master, width, height } = currentDeck;

  const setPlaceholders = (placeholders: SlideMaster['placeholders']) => {
    mutate((deck) => ({ ...deck, master: { ...deck.master, placeholders } }));
  };

  const addPlaceholder = () => {
    setPlaceholders([
      ...master.placeholders,
      {
        id: generateId('ph'),
        kind: 'title',
        x: Math.round(width * 0.08),
        y: Math.round(height * 0.08),
        w: Math.round(width * 0.84),
        h: Math.round(height * 0.1),
      },
    ]);
  };

  const seedDefault = () => {
    mutate((deck) => ({ ...deck, master: defaultMaster(width, height) }));
  };

  const applyToSlide = () => {
    if (!activeSlideId) return;
    mutate((deck) => ({
      ...deck,
      slides: deck.slides.map((s) =>
        s.id === activeSlideId ? applyMasterToSlide(deck.master, s) : s,
      ),
    }));
  };

  return (
    <div className='flex flex-col gap-3 p-3'>
      <div className='text-xs font-semibold tracking-wide uppercase opacity-70'>Slide master</div>
      <p className='text-[11px] opacity-50'>
        Placeholders define where titles and content sit on every slide that applies this master.
      </p>

      {master.placeholders.length === 0 && (
        <button type='button' onClick={seedDefault} className='btn btn-outline btn-xs'>
          Seed default master
        </button>
      )}

      {master.placeholders.map((ph, i) => (
        <div key={ph.id} className='border-base-300 rounded-xl border p-2'>
          <div className='mb-1 flex items-center justify-between'>
            <span className='text-[10px] font-semibold uppercase opacity-60'>
              Placeholder {i + 1}
            </span>
            <button
              type='button'
              title='Remove placeholder'
              onClick={() => setPlaceholders(master.placeholders.filter((p) => p.id !== ph.id))}
              className='text-error/70 hover:text-error'>
              <FiTrash2 className='size-3.5' />
            </button>
          </div>
          <div className='flex flex-col gap-1.5'>
            <SelectInput
              label='Kind'
              value={ph.kind}
              options={[...KINDS]}
              onChange={(kind) =>
                setPlaceholders(
                  master.placeholders.map((p) =>
                    p.id === ph.id ? { ...p, kind: kind as (typeof KINDS)[number]['value'] } : p,
                  ),
                )
              }
            />
            <div className='grid grid-cols-2 gap-1.5'>
              <NumberInput
                label='X'
                value={ph.x}
                onChange={(x) =>
                  setPlaceholders(
                    master.placeholders.map((p) => (p.id === ph.id ? { ...p, x } : p)),
                  )
                }
              />
              <NumberInput
                label='Y'
                value={ph.y}
                onChange={(y) =>
                  setPlaceholders(
                    master.placeholders.map((p) => (p.id === ph.id ? { ...p, y } : p)),
                  )
                }
              />
              <NumberInput
                label='W'
                value={ph.w}
                onChange={(w) =>
                  setPlaceholders(
                    master.placeholders.map((p) => (p.id === ph.id ? { ...p, w } : p)),
                  )
                }
              />
              <NumberInput
                label='H'
                value={ph.h}
                onChange={(h) =>
                  setPlaceholders(
                    master.placeholders.map((p) => (p.id === ph.id ? { ...p, h } : p)),
                  )
                }
              />
            </div>
          </div>
        </div>
      ))}

      <button type='button' onClick={addPlaceholder} className='btn btn-outline btn-xs gap-1'>
        <FiPlus className='size-3.5' /> Add placeholder
      </button>

      <button
        type='button'
        onClick={applyToSlide}
        disabled={!activeSlideId || master.placeholders.length === 0}
        className='btn btn-primary btn-xs gap-1'>
        <FiCheckCircle className='size-3.5' /> Apply to current slide
      </button>
    </div>
  );
};
