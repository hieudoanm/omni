'use client';

import { type FC } from 'react';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { NumberInput, SelectInput, Toggle } from '@/components/office/keynotes/atoms/FormControls';
import { TRANSITION_EFFECTS } from '@/lib/office/keynotes/animations';
import type { TransitionEffect } from '@/types/keynotes/deck';

export const TransitionsPanel: FC = () => {
  const { activeSlide, setSlideTransition, setSlideAutoAdvance } = useDeck();

  if (!activeSlide) return null;
  const t = activeSlide.transition;

  return (
    <div className='flex flex-col gap-3 p-3'>
      <div className='text-xs font-semibold tracking-wide uppercase opacity-70'>
        Slide transition
      </div>
      <SelectInput
        label='Effect'
        value={t.effect}
        options={TRANSITION_EFFECTS.map((e) => ({
          value: e.id,
          label: e.label,
        }))}
        onChange={(v) => setSlideTransition({ ...t, effect: v as TransitionEffect })}
      />
      <div className='grid grid-cols-2 gap-2'>
        <NumberInput
          label='Duration'
          value={t.duration}
          min={100}
          max={5000}
          step={100}
          onChange={(v) => setSlideTransition({ ...t, duration: v })}
        />
        <NumberInput
          label='Bounciness'
          value={t.bounciness ?? 0}
          min={0}
          max={100}
          step={10}
          onChange={(v) => setSlideTransition({ ...t, bounciness: v })}
        />
        <SelectInput
          label='Direction'
          value={t.direction}
          options={[
            { value: 'forward', label: 'Forward' },
            { value: 'backward', label: 'Backward' },
          ]}
          onChange={(v) => setSlideTransition({ ...t, direction: v as 'forward' | 'backward' })}
        />
      </div>
      <div className='divider my-1' />
      <div className='text-xs font-semibold tracking-wide uppercase opacity-70'>Auto advance</div>
      <Toggle
        label='Auto advance'
        checked={activeSlide.autoAdvance != null}
        onChange={(v) => setSlideAutoAdvance(v ? 5 : undefined)}
      />
      {activeSlide.autoAdvance != null && (
        <NumberInput
          label='Seconds'
          value={activeSlide.autoAdvance}
          min={1}
          max={120}
          onChange={(v) => setSlideAutoAdvance(v)}
        />
      )}
    </div>
  );
};
