'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Option, Reel } from './data/constants';
import { CATEGORIES, TECH_REEL_COUNT } from './data/constants';
import { Header } from './components/Header';
import { ReelGrid } from './components/ReelGrid';
import { SpinButton } from './components/SpinButton';

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const SPIN_DURATION = 1600;
const REEL_INTERVAL = 60;

interface ReelState {
  emoji: string;
  label: string;
  current: Option;
}

const buildInitial = (reels: Reel[]): ReelState[] =>
  reels.map(({ emoji, label, options }) => ({
    emoji,
    label,
    current: options[0],
  }));

export const VibeSlotCode = () => {
  const [activeTab, setActiveTab] = useState(0);
  const currentReels = CATEGORIES[activeTab].reels;

  const [display, setDisplay] = useState<ReelState[]>(() => buildInitial(currentReels));
  const [hasEverSpun, setHasEverSpun] = useState(false);
  const [spinningIndices, setSpinningIndices] = useState<boolean[]>(() =>
    currentReels.map(() => false),
  );
  const spinningRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const spinningIndicesRef = useRef<boolean[]>(spinningIndices);
  spinningIndicesRef.current = spinningIndices;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const switchTab = useCallback((index: number) => {
    if (spinningRef.current) return;
    setActiveTab(index);
    setDisplay(buildInitial(CATEGORIES[index].reels));
    setSpinningIndices(CATEGORIES[index].reels.map(() => false));
    setHasEverSpun(false);
  }, []);

  const spinSingle = useCallback(
    (index: number) => {
      if (spinningRef.current) return;
      spinningRef.current = true;

      setSpinningIndices((prev) => {
        const next = [...prev];
        next[index] = true;
        return next;
      });

      const reel = currentReels[index];
      const finalOption = pickRandom<Option>(reel.options);

      intervalRef.current = setInterval(() => {
        setDisplay((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], current: pickRandom(reel.options) };
          return next;
        });
      }, REEL_INTERVAL);

      setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setDisplay((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], current: finalOption };
          return next;
        });
        setSpinningIndices((prev) => {
          const next = [...prev];
          next[index] = false;
          return next;
        });
        spinningRef.current = false;
        setHasEverSpun(true);
      }, SPIN_DURATION);
    },
    [currentReels],
  );

  const STAGGER_MS = 1_000;

  const spinAll = useCallback(() => {
    if (spinningRef.current) return;
    spinningRef.current = true;

    const catIndex = Math.floor(Math.random() * CATEGORIES.length);
    const catReels = CATEGORIES[catIndex].reels;
    const baseIndex = Math.floor(Math.random() * 10);

    const finalState = catReels.map(({ emoji, label, options }, i) => ({
      emoji,
      label,
      current: i < TECH_REEL_COUNT ? options[baseIndex] : pickRandom(options),
    }));

    setActiveTab(catIndex);
    setDisplay(
      catReels.map(({ emoji, label, options }) => ({
        emoji,
        label,
        current: options[0],
      })),
    );
    setSpinningIndices(catReels.map(() => true));

    intervalRef.current = setInterval(() => {
      setDisplay((prev) =>
        prev.map((item, i) =>
          spinningIndicesRef.current[i]
            ? { ...item, current: pickRandom(catReels[i].options) }
            : item,
        ),
      );
    }, REEL_INTERVAL);

    timeoutsRef.current = catReels.map((_reel, index) =>
      setTimeout(
        () => {
          setDisplay((prev) => {
            const next = [...prev];
            next[index] = finalState[index];
            return next;
          });
          setSpinningIndices((prev) => {
            const next = [...prev];
            next[index] = false;
            return next;
          });

          if (index === catReels.length - 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
            spinningRef.current = false;
            setHasEverSpun(true);
          }
        },
        SPIN_DURATION + index * STAGGER_MS,
      ),
    );
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !spinningRef.current) {
        e.preventDefault();
        spinAll();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [spinAll]);

  const isAnySpinning = spinningIndices.some(Boolean);
  const totalCombos = CATEGORIES.length * 10 * CATEGORIES[0].reels[TECH_REEL_COUNT].options.length;

  return (
    <div className='flex min-h-screen flex-col items-center justify-center px-3 py-8 sm:px-4'>
      <div className='flex w-full max-w-5xl flex-col items-center gap-6 sm:gap-10'>
        <Header />

        <div className='flex flex-wrap items-center justify-center gap-2'>
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.id}
              disabled={isAnySpinning}
              onClick={() => switchTab(i)}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold tracking-wider uppercase transition-all sm:text-sm ${
                i === activeTab
                  ? 'border-base-content/40 bg-base-content/10 text-base-content'
                  : 'border-base-content/10 text-base-content/50 hover:border-base-content/20 hover:text-base-content/70'
              }`}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        <ReelGrid display={display} spinningIndices={spinningIndices} onSpinSingle={spinSingle} />

        <div className='flex flex-col items-center gap-2'>
          <SpinButton spinning={isAnySpinning} hasLanded={hasEverSpun} onClick={spinAll} />

          <p className='text-base-content/20 text-[10px] sm:text-xs'>
            {totalCombos.toLocaleString()} possible combinations
          </p>
        </div>
      </div>
    </div>
  );
};
