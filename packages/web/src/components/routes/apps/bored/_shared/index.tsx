'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HowToModal } from './components/HowToModal';
import { ItemSelect } from './components/ItemSelect';
import { RecordSpin } from './components/RecordSpin';
import { Reel } from './components/Reel';
import { useTopicPicker } from './hooks/useTopicPicker';
import type { Category, Item } from './types';

interface GameConfig {
  title: string;
  itemLabel: string;
  itemLabelPlural: string;
  actionLabel: string;
  howToTitle: string;
  totalLabel: string;
  rollValue: string;
  sourceName: string;
  sourceUrl: string;
  categories: Category[];
  items: Item[];
  topicsMap: Record<string, string[]>;
  total: number;
  content: string;
}

export const BoredGame = ({
  title,
  itemLabel,
  itemLabelPlural,
  actionLabel,
  howToTitle,
  totalLabel,
  rollValue,
  sourceName,
  sourceUrl,
  categories,
  items,
  topicsMap,
  total,
  content,
}: GameConfig) => {
  const { item, setItem, topic, spinning, topics, spin } = useTopicPicker(topicsMap);
  const [howToOpen, setHowToOpen] = useState(false);
  const gameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'Enter') && !spinning) {
        e.preventDefault();
        spin();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [spin, spinning]);

  const activeItem = items.find((n) => n.value === item);
  const itemTopicMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [nicheValue, ts] of Object.entries(topicsMap)) {
      if (nicheValue === 'all') continue;
      const niche = items.find((n) => n.value === nicheValue);
      for (const t of ts) map[t] = niche?.label ?? '';
    }
    return map;
  }, [topicsMap, items]);

  const derivedItemLabel =
    item === 'all' && topic ? (itemTopicMap[topic] ?? activeItem?.label) : activeItem?.label;

  const activeCategory = categories.find((c) =>
    items.some(
      (n) =>
        n.value ===
          (item === 'all' && topic
            ? (Object.entries(topicsMap).find(([, ts]) => ts.includes(topic))?.[0] ?? item)
            : item) && n.category === c.value,
    ),
  );

  return (
    <div className='container mx-auto flex h-screen w-full flex-col items-center p-4 md:h-full md:p-8 lg:p-12'>
      <div
        ref={gameRef}
        className='flex w-full flex-1 flex-col items-center justify-center gap-6 md:gap-8'>
        <div className='flex w-full flex-col items-center justify-between gap-8 md:flex-row'>
          <div className='text-center md:text-left'>
            <h1 className='text-base-content m-0 font-serif text-2xl font-medium tracking-wider sm:text-3xl'>
              {title}
            </h1>
            <div className='mt-2'>
              <p className='text-base-content/70 m-0 text-sm md:text-base'>
                Pick a {itemLabel} and{' '}
                <button
                  onClick={() => setHowToOpen(true)}
                  className='text-primary inline cursor-pointer underline-offset-2 hover:underline'>
                  {actionLabel}
                </button>
              </p>
            </div>
          </div>
          <div className='flex w-full max-w-xs flex-col items-center gap-y-2 md:items-end'>
            <ItemSelect
              categories={categories}
              items={items}
              value={item}
              onChange={setItem}
              allLabel={`All ${itemLabelPlural}`}
              placeholder={`Search ${itemLabelPlural}…`}
            />
            <p className='text-base-content/70 text-sm md:text-base'>
              {total.toLocaleString()} {totalLabel} • Inspired by{' '}
              <Link
                href={sourceUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary underline-offset-2 hover:underline'>
                {sourceName}
              </Link>
            </p>
          </div>
        </div>
        <div className='flex-1'>
          <div className='flex h-full'>
            <Reel
              topics={topics}
              spinning={spinning}
              landed={!spinning && !!topic}
              current={topic}
              itemLabel={derivedItemLabel}
              categoryLabel={activeCategory?.label}
            />
          </div>
        </div>

        <div className='flex flex-col items-center gap-3'>
          <button
            onClick={spin}
            disabled={spinning}
            className='btn btn-primary btn-lg min-w-40 rounded-full font-bold tracking-wider'>
            {spinning ? 'Rolling…' : `Roll ${rollValue}`}
          </button>
          <p className='text-base-content/40 text-xs'>
            or press <kbd className='kbd kbd-xs'>Spacebar / Enter</kbd>
          </p>
        </div>
      </div>

      <div className='py-3'>
        <RecordSpin captureRef={gameRef} spin={spin} spinning={spinning} />
      </div>

      <HowToModal
        open={howToOpen}
        onClose={() => setHowToOpen(false)}
        title={howToTitle}
        content={content}
      />
    </div>
  );
};
