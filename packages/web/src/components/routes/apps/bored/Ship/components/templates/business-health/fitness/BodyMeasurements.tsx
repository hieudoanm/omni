import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const BodyMeasurements: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Progress Tracker';
  const measurements = (data.measurements as {
    part: string;
    current: string;
    previous: string;
  }[]) ?? [
    { part: 'Chest', current: '42"', previous: '40"' },
    { part: 'Waist', current: '32"', previous: '34"' },
    { part: 'Arms', current: '15"', previous: '14"' },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content mb-6 text-4xl font-bold'>{title}</h1>
      <ul className='flex flex-1 flex-col gap-3'>
        {measurements.map((m, i) => {
          const diff = (parseFloat(m.current) || 0) - (parseFloat(m.previous) || 0);
          return (
            <li
              key={i}
              className='bg-base-200 flex items-center justify-between rounded-lg px-4 py-3'>
              <span className='text-base-content text-sm font-bold'>{m.part}</span>
              <div className='flex items-center gap-3'>
                <span className='text-neutral text-xs'>{m.previous}</span>
                <svg
                  className='text-neutral h-3 w-3'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={2.5}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M13 7l5 5m0 0l-5 5m5-5H6' />
                </svg>
                <span className='text-base-content text-sm font-bold'>{m.current}</span>
                <span className={`text-xs font-bold ${diff > 0 ? 'text-success' : 'text-error'}`}>
                  {diff > 0 ? '+' : ''}
                  {diff.toFixed(1)}
                </span>
                <Footer citation={citation} />
              </div>
            </li>
          );
        })}
      </ul>
    </Background>
  );
};

BodyMeasurements.displayName = 'BodyMeasurements';
