import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Point {
  x: number;
  y: number;
  label?: string;
}

export const ScatterChart: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Scatter Plot';
  const text = (data.text as string) ?? '';
  const points = (data.points as Point[]) ?? [
    { x: 10, y: 25 },
    { x: 20, y: 40 },
    { x: 35, y: 30 },
    { x: 50, y: 65 },
    { x: 65, y: 55 },
    { x: 80, y: 75 },
    { x: 90, y: 60 },
  ];

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs) || 1;
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys) || 1;

  const viewW = 280;
  const viewH = 170;
  const padX = 30;
  const padY = 20;

  const coords = points.map((p) => ({
    cx: padX + ((p.x - minX) / (maxX - minX || 1)) * (viewW - padX * 2),
    cy: padY + (1 - (p.y - minY) / (maxY - minY || 1)) * (viewH - padY * 2),
    label: p.label,
  }));

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-2 text-center'>
        <h2 className='text-base-content text-sm font-bold'>{title}</h2>
        {text && <p className='text-neutral mt-1 text-xs'>{text}</p>}
        <Footer citation={citation} />
      </div>
      <svg viewBox={`0 0 ${viewW} ${viewH}`} className='h-auto w-full max-w-[320px]'>
        {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
          const y = padY + frac * (viewH - padY * 2);
          return (
            <line
              key={`g${i}`}
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
        {coords.map((c, i) => (
          <g key={i}>
            <circle cx={c.cx} cy={c.cy} r={4} fill='#ff0030' opacity={0.8} />
            {c.label && (
              <text
                x={c.cx}
                y={c.cy - 7}
                textAnchor='middle'
                className='fill-base-content'
                fontSize={6}>
                {c.label}
              </text>
            )}
          </g>
        ))}
        <text x={viewW / 2} y={viewH - 2} textAnchor='middle' className='fill-neutral' fontSize={6}>
          X Axis
        </text>
        <text
          x={6}
          y={viewH / 2}
          textAnchor='middle'
          className='fill-neutral'
          fontSize={6}
          transform={`rotate(-90, 6, ${viewH / 2})`}>
          Y Axis
        </text>
      </svg>
    </Background>
  );
};

ScatterChart.displayName = 'ScatterChart';
