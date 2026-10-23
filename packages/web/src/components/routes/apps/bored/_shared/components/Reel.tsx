'use client';

import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

interface ReelProps {
  topics: string[];
  spinning: boolean;
  landed: boolean;
  current: string;
  itemLabel?: string;
  categoryLabel?: string;
}

export const Reel: FC<ReelProps> = ({
  topics,
  spinning,
  landed,
  current,
  itemLabel,
  categoryLabel,
}) => {
  const [displayed, setDisplayed] = useState(current);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (spinning) {
      let i = topics.indexOf(current);
      if (i < 0) i = 0;
      intervalRef.current = setInterval(() => {
        i = (i + 1) % topics.length;
        setDisplayed(topics[i]);
      }, 80);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayed(current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [spinning, current, topics]);

  const showLabel = landed || spinning;

  let label = '';
  if (showLabel && landed) {
    const parts = ['Your Topic'];
    if (categoryLabel) parts.push(categoryLabel);
    if (itemLabel) parts.push(itemLabel);
    label = parts.join(' · ');
  } else if (showLabel) {
    label = 'Rolling…';
  }

  return (
    <div className='flex min-h-40 w-full flex-col items-center justify-center gap-2'>
      {showLabel && (
        <p className='text-accent m-0 text-xs font-bold tracking-widest uppercase'>{label}</p>
      )}
      <p
        className={`container m-0 mx-auto text-center font-serif text-5xl leading-tight font-medium tracking-tighter capitalize transition-all duration-300 sm:text-6xl md:text-7xl lg:text-8xl ${
          spinning ? 'text-base-content/90' : 'text-base-content'
        }`}>
        {spinning ? (
          displayed
        ) : current ? (
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(current)}`}
            target='_blank'
            rel='noopener noreferrer'
            title={`Search Google for "${current}"`}
            className='underline-offset-8 hover:underline'>
            {current}
          </a>
        ) : (
          '🎯'
        )}
      </p>
    </div>
  );
};

Reel.displayName = 'Reel';
