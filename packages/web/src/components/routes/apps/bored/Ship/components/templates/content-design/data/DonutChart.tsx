import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

const PAL = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-neutral'];
const R = 80;
const C = 2 * Math.PI * R;

export const DonutChart: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const input = (data.segments as { label: string; pct: number }[]) ?? [];
  const list =
    input.length > 0
      ? input
      : [
          { label: 'Chrome', pct: 65 },
          { label: 'Firefox', pct: 18 },
          { label: 'Safari', pct: 12 },
          { label: 'Other', pct: 5 },
        ];
  const total = list.reduce((sum, s) => sum + s.pct, 0);
  let off = 0;

  const citation = (data.citation as string) ?? '';

  return (
    <Background>
      <h1 className='text-base-content mb-4 text-center text-4xl font-bold tracking-tight'>
        {title || 'Market Share'}
      </h1>
      <div className='relative'>
        <svg width={200} height={200}>
          {list.map((seg, i) => {
            const d = (seg.pct / total) * C;
            const el = (
              <circle
                key={i}
                cx={100}
                cy={100}
                r={R}
                fill='none'
                stroke='currentColor'
                strokeWidth={24}
                strokeDasharray={`${d} ${C - d}`}
                strokeDashoffset={-off}
                className={PAL[i % PAL.length]}
                strokeLinecap='round'
                transform='rotate(-90 100 100)'
              />
            );
            off += d;
            return el;
          })}
        </svg>
        <div className='absolute inset-0 flex flex-col items-center justify-center'>
          <span className='text-base-content text-4xl font-black'>{total}%</span>
          <span className='text-neutral text-xs'>Total</span>
        </div>
      </div>
      <ul className='mt-4 flex flex-wrap justify-center gap-2'>
        {list.map((seg, i) => (
          <li key={i} className='flex items-center gap-1'>
            <span className={`inline-block h-3 w-3 rounded-full ${PAL[i % PAL.length]}`} />
            <span className='text-base-content text-xs font-medium'>{seg.label}</span>
            <span className='text-primary text-xs font-bold'>{seg.pct}%</span>
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

DonutChart.displayName = 'DonutChart';
