import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Slice {
  label: string;
  value: number;
}

export const PieChart: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Pie Chart';
  const text = (data.text as string) ?? '';
  const slices = (data.slices as Slice[]) ?? [
    { label: 'Direct', value: 40 },
    { label: 'Organic', value: 25 },
    { label: 'Referral', value: 20 },
    { label: 'Social', value: 15 },
  ];

  const total = slices.reduce((s, sl) => s + sl.value, 0) || 1;
  const cx = 110;
  const cy = 90;
  const r = 60;
  const colors = ['#ff0030', '#d90029', '#b30022', '#8c001b', '#660014'];

  let cum = 0;
  const paths = slices.map((sl, i) => {
    const start = (cum / total) * 2 * Math.PI;
    cum += sl.value;
    const end = (cum / total) * 2 * Math.PI;
    const largeArc = sl.value / total > 0.5 ? 1 : 0;
    const sx = cx + r * Math.cos(start - Math.PI / 2);
    const sy = cy + r * Math.sin(start - Math.PI / 2);
    const ex = cx + r * Math.cos(end - Math.PI / 2);
    const ey = cy + r * Math.sin(end - Math.PI / 2);
    const d = `M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey} Z`;
    return {
      d,
      color: colors[i % colors.length],
      label: sl.label,
      pct: Math.round((sl.value / total) * 100),
    };
  });

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-2 text-center'>
        <h2 className='text-base-content text-sm font-bold'>{title}</h2>
        {text && <p className='text-neutral mt-1 text-xs'>{text}</p>}
        <Footer citation={citation} />
      </div>
      <svg viewBox='0 0 220 180' className='h-auto w-full max-w-[300px]'>
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} opacity={0.85} />
        ))}
        {paths.map((p, i) => {
          const midAngle =
            (slices.slice(0, i).reduce((s, sl) => s + sl.value, 0) / total) * 2 * Math.PI +
            (slices[i].value / total) * Math.PI;
          const lx = cx + (r + 16) * Math.cos(midAngle - Math.PI / 2);
          const ly = cy + (r + 16) * Math.sin(midAngle - Math.PI / 2);
          return (
            <text
              key={`l${i}`}
              x={lx}
              y={ly}
              textAnchor='middle'
              dominantBaseline='middle'
              className='fill-base-content'
              fontSize={6.5}
              fontWeight={600}>
              {p.label} {p.pct}%
            </text>
          );
        })}
      </svg>
    </Background>
  );
};

PieChart.displayName = 'PieChart';
