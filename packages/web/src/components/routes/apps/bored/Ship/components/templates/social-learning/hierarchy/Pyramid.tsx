import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Level {
  label: string;
  items: string[];
}

export const Pyramid: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Pyramid';
  const text = (data.text as string) ?? '';
  const levels = (data.levels as Level[]) ?? [
    { label: 'Top', items: ['Most important'] },
    { label: 'Upper', items: ['High priority', 'Key goals'] },
    { label: 'Middle', items: ['Medium priority', 'Supporting tasks'] },
    { label: 'Lower', items: ['Low priority', 'Nice to have'] },
    { label: 'Base', items: ['Foundation', 'Basics'] },
  ];

  const colors = ['#ff0030', '#d90029', '#b30022', '#8c001b', '#660014'];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-3 text-center'>
        <h2 className='text-base-content text-sm font-bold'>{title}</h2>
        {text && <div className='text-neutral mt-2 text-sm'>{text}</div>}
      </div>
      <div className='flex flex-1 flex-col items-center justify-center gap-2'>
        {levels.map((level, i) => {
          const width = 30 + i * 16;
          return (
            <div key={i} className='flex w-full justify-center'>
              <div
                className='flex flex-col items-center rounded-2xl px-4 py-2'
                style={{
                  width: `${width}%`,
                  backgroundColor: colors[i % colors.length],
                }}>
                <span className='text-sm font-bold text-white/80'>{level.label}</span>
                <ul className='mt-2 flex flex-wrap justify-center gap-2'>
                  {level.items.map((item, j) => (
                    <li key={j} className='text-sm font-medium text-white'>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Footer citation={citation} />
            </div>
          );
        })}
      </div>
    </Background>
  );
};

Pyramid.displayName = 'Pyramid';
