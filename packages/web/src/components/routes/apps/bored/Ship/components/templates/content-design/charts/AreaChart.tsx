import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface DataPoint {
  label: string;
  value: number;
}

export const AreaChart: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Area Chart';
  const text = (data.text as string) ?? '';
  const points = (data.points as DataPoint[]) ?? [
    { label: 'Jan', value: 20 },
    { label: 'Feb', value: 35 },
    { label: 'Mar', value: 50 },
    { label: 'Apr', value: 45 },
    { label: 'May', value: 70 },
    { label: 'Jun', value: 60 },
  ];

  const maxVal = Math.max(...points.map((p) => p.value), 1);
  const viewW = 280;
  const viewH = 160;
  const padX = 30;
  const padY = 20;

  const coords = points.map((p, i) => ({
    x: padX + (i / (points.length - 1)) * (viewW - padX * 2),
    y: padY + (1 - p.value / maxVal) * (viewH - padY * 2),
    label: p.label,
    value: p.value,
  }));

  const lineD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const areaD = `${lineD} L ${coords[coords.length - 1].x} ${viewH - padY} L ${coords[0].x} ${viewH - padY} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-2 text-center'>
        <h2 className='text-base-content text-sm font-bold'>{title}</h2>
        {text && <p className='text-neutral mt-1 text-xs'>{text}</p>}
        <Footer citation={citation} />
      </div>
      <svg viewBox={`0 0 ${viewW} ${viewH}`} className='h-auto w-full max-w-[320px]'>
        {gridLines.map((frac, i) => {
          const y = padY + frac * (viewH - padY * 2);
          return (
            <line
              key={i}
              x1={padX}
              y1={y}
              x2={viewW - padX}
              y2={y}
              stroke='#ffd5de'
              opacity={0.2}
              strokeWidth={0.5}
            />
          );
        })}
        <path d={areaD} fill='#ff0030' opacity={0.2} />
        <path
          d={lineD}
          fill='none'
          stroke='#ff0030'
          strokeWidth={2}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        {coords.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r={3} fill='#ff0030' />
            <text x={c.x} y={viewH - 4} textAnchor='middle' className='fill-neutral' fontSize={7}>
              {c.label}
            </text>
            <text
              x={c.x}
              y={c.y - 6}
              textAnchor='middle'
              className='fill-base-content'
              fontSize={6.5}
              fontWeight={600}>
              {c.value}
            </text>
          </g>
        ))}
      </svg>
    </Background>
  );
};

AreaChart.displayName = 'AreaChart';
