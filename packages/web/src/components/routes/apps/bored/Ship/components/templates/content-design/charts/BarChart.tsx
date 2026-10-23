import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface BarItem {
  label: string;
  value: number;
}

export const BarChart: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Bar Chart';
  const text = (data.text as string) ?? '';
  const items = (data.items as BarItem[]) ?? [
    { label: 'A', value: 65 },
    { label: 'B', value: 90 },
    { label: 'C', value: 45 },
    { label: 'D', value: 80 },
    { label: 'E', value: 55 },
  ];

  const maxVal = Math.max(...items.map((b) => b.value), 1);
  const barW = 28;
  const gap = 12;
  const viewH = 160;
  const chartH = viewH - 30;

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-2 text-center'>
        <h2 className='text-base-content text-sm font-bold'>{title}</h2>
        {text && <p className='text-neutral mt-1 text-xs'>{text}</p>}
        <Footer citation={citation} />
      </div>
      <svg
        viewBox={`0 0 ${items.length * (barW + gap)} ${viewH}`}
        className='mx-auto h-auto w-full max-w-[320px]'>
        {items.map((b, i) => {
          const barH = (b.value / maxVal) * (chartH - 10);
          const x = i * (barW + gap);
          const y = chartH - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx={3} fill='#ff0030' opacity={0.85} />
              <text
                x={x + barW / 2}
                y={y - 4}
                textAnchor='middle'
                className='fill-base-content'
                fontSize={7}
                fontWeight={600}>
                {b.value}
              </text>
              <text
                x={x + barW / 2}
                y={viewH - 4}
                textAnchor='middle'
                className='fill-neutral'
                fontSize={7}>
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>
    </Background>
  );
};

BarChart.displayName = 'BarChart';
