import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const HeatmapGrid: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Heatmap';
  const rows = (data.rows as string[]) ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const cols = (data.cols as string[]) ?? ['AM', 'PM', 'Eve'];
  const values = (data.values as number[][]) ?? [
    [30, 60, 90],
    [45, 80, 50],
    [70, 35, 65],
    [90, 55, 40],
    [20, 75, 85],
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h2 className='text-base-content mb-2 text-sm font-bold'>{title}</h2>
      <div className='flex flex-col gap-1'>
        <div className='flex gap-1'>
          <div className='w-10' />
          {cols.map((c, ci) => (
            <div
              key={ci}
              className='text-neutral flex w-14 items-center justify-center text-[8px] font-bold'>
              {c}
            </div>
          ))}
        </div>
        {rows.map((row, ri) => (
          <div key={ri} className='flex gap-1'>
            <div className='text-neutral flex w-10 items-center justify-end pr-2 text-[8px] font-bold'>
              {row}
            </div>
            {(values[ri] ?? []).map((val, ci) => (
              <div
                key={ci}
                className='bg-primary flex h-10 w-14 items-center justify-center rounded text-[8px] font-bold text-white'
                style={{ opacity: 0.15 + (val / 100) * 0.85 }}>
                {val}
              </div>
            ))}
          </div>
        ))}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

HeatmapGrid.displayName = 'HeatmapGrid';
