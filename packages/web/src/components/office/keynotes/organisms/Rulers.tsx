'use client';

import { type FC } from 'react';

const TICK = 50;

const marksFor = (length: number, tick: number): number[] => {
  const marks: number[] = [];
  for (let i = 0; i * tick <= length + tick; i++) marks.push(i * tick);
  return marks;
};

export const HRuler: FC<{ length: number; zoom: number }> = ({ length, zoom }) => {
  const marks = marksFor(length, TICK * zoom);
  return (
    <svg className='h-full w-full text-neutral-500'>
      {marks.map((m) => {
        const major = m % (100 * zoom) < 1;
        return (
          <g key={m}>
            <line x1={m} y1={0} x2={m} y2={major ? 14 : 7} stroke='currentColor' strokeWidth={1} />
            {major && (
              <text x={m + 2} y={11} fontSize={9} fill='currentColor'>
                {Math.round(m / zoom)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export const VRuler: FC<{ length: number; zoom: number }> = ({ length, zoom }) => {
  const marks = marksFor(length, TICK * zoom);
  return (
    <svg className='h-full w-full text-neutral-500'>
      {marks.map((m) => {
        const major = m % (100 * zoom) < 1;
        return (
          <g key={m}>
            <line x1={0} y1={m} x2={major ? 14 : 7} y2={m} stroke='currentColor' strokeWidth={1} />
            {major && (
              <text
                x={3}
                y={m - 2}
                fontSize={9}
                fill='currentColor'
                transform={`rotate(90 3 ${m - 2})`}>
                {Math.round(m / zoom)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
