import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const Sparkline: FC<TemplateProps> = ({ data }) => {
  const label = (data.label as string) ?? 'Revenue Trend';
  const values = (data.values as number[]) ?? [20, 35, 25, 45, 40, 55, 50, 65, 60, 75];
  const current = (data.current as string) ?? '$75K';

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 280;
  const h = 100;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <p className='text-neutral mb-1 text-xs font-bold tracking-wider uppercase'>{label}</p>
      <svg viewBox={`0 0 ${w} ${h}`} className='mb-2 w-full max-w-xs'>
        <polyline
          fill='none'
          stroke='currentColor'
          strokeWidth='2.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='text-primary'
          points={points}
        />
        <circle
          cx={((values.length - 1) / (values.length - 1)) * w}
          cy={h - ((values[values.length - 1] - min) / range) * h}
          r='4'
          className='fill-accent'
        />
      </svg>
      <div className='text-primary text-2xl font-black'>{current}</div>
      <Footer citation={citation} />
    </Background>
  );
};

Sparkline.displayName = 'Sparkline';
