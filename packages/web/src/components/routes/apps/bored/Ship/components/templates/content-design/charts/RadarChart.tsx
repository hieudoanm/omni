import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Axis {
  label: string;
  value: number;
}

export const RadarChart: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Radar Chart';
  const text = (data.text as string) ?? '';
  const axes = (data.axes as Axis[]) ?? [
    { label: 'Speed', value: 80 },
    { label: 'Power', value: 65 },
    { label: 'Defense', value: 90 },
    { label: 'Agility', value: 50 },
    { label: 'Stamina', value: 75 },
    { label: 'Skill', value: 60 },
  ];

  const cx = 90;
  const cy = 85;
  const r = 60;
  const n = axes.length;
  const maxVal = Math.max(...axes.map((a) => a.value), 1);

  const angle = (i: number) => (i / n) * 2 * Math.PI - Math.PI / 2;

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const rings = gridLevels.map((lvl) => {
    const pts = Array.from({ length: n }, (_, i) => {
      const a = angle(i);
      return `${cx + r * lvl * Math.cos(a)},${cy + r * lvl * Math.sin(a)}`;
    });
    return pts.join(' ');
  });

  const spokes = Array.from({ length: n }, (_, i) => {
    const a = angle(i);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });

  const dataPts = axes.map((a, i) => {
    const frac = a.value / maxVal;
    const ang = angle(i);
    return {
      x: cx + r * frac * Math.cos(ang),
      y: cy + r * frac * Math.sin(ang),
    };
  });
  const dataPath = dataPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-2 text-center'>
        <h2 className='text-base-content text-sm font-bold'>{title}</h2>
        {text && <p className='text-neutral mt-1 text-xs'>{text}</p>}
        <Footer citation={citation} />
      </div>
      <svg viewBox='0 0 190 180' className='h-auto w-full max-w-[280px]'>
        {rings.map((pts, i) => (
          <polygon
            key={i}
            points={pts}
            fill='none'
            stroke='#ffd5de'
            strokeWidth={0.5}
            opacity={0.3}
          />
        ))}
        {spokes.map((s, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={s.x}
            y2={s.y}
            stroke='#ffd5de'
            strokeWidth={0.5}
            opacity={0.3}
          />
        ))}
        <polygon
          points={dataPts.map((p) => `${p.x},${p.y}`).join(' ')}
          fill='#ff0030'
          opacity={0.25}
          stroke='#ff0030'
          strokeWidth={1.5}
        />
        {dataPts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2.5} fill='#ff0030' />
        ))}
        {spokes.map((s, i) => {
          const lx = cx + (r + 14) * Math.cos(angle(i));
          const ly = cy + (r + 14) * Math.sin(angle(i));
          return (
            <text
              key={`l${i}`}
              x={lx}
              y={ly}
              textAnchor='middle'
              dominantBaseline='middle'
              className='fill-base-content'
              fontSize={6}
              fontWeight={600}>
              {axes[i].label}
            </text>
          );
        })}
      </svg>
    </Background>
  );
};

RadarChart.displayName = 'RadarChart';
