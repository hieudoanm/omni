import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const ProgressRing: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Progress';
  const text = (data.text as string) ?? '';
  const value = (data.value as number) ?? 72;
  const label = (data.label as string) ?? 'Complete';

  const r = 70;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h2 className='text-base-content mb-2 text-sm font-bold'>{title}</h2>
      {text && <p className='text-neutral mb-2 text-xs'>{text}</p>}
      <svg viewBox='0 0 180 180' className='h-auto w-48'>
        <circle cx={90} cy={90} r={r} fill='none' strokeWidth={12} className='stroke-base-300' />
        <circle
          cx={90}
          cy={90}
          r={r}
          fill='none'
          strokeWidth={12}
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className='stroke-primary'
          transform='rotate(-90 90 90)'
        />
        <text
          x={90}
          y={85}
          textAnchor='middle'
          className='fill-base-content'
          fontSize={28}
          fontWeight={700}>
          {value}%
        </text>
        <text x={90} y={105} textAnchor='middle' className='fill-neutral' fontSize={11}>
          {label}
        </text>
      </svg>
      <Footer citation={citation} />
    </Background>
  );
};

ProgressRing.displayName = 'ProgressRing';
