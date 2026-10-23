import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const YogaPose: FC<TemplateProps> = ({ data }) => {
  const name = (data.name as string) ?? '';
  const difficulty = (data.difficulty as string) ?? '';
  const benefits = (data.benefits as string[]) ?? [];
  const duration = (data.duration as string) ?? '';
  const instructions = (data.instructions as string[]) ?? [];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex items-start justify-between'>
        <h1 className='text-base-content text-4xl font-bold'>{name}</h1>
        {difficulty && (
          <span
            className={`rounded-full px-3 py-0.5 text-xs font-bold ${
              difficulty === 'Beginner'
                ? 'bg-accent/10 text-accent'
                : difficulty === 'Intermediate'
                  ? 'bg-accent/20 text-accent'
                  : 'bg-accent/30 text-accent'
            }`}>
            {difficulty}
          </span>
        )}
      </div>
      {duration && <span className='text-neutral mt-1 text-xs'>Hold for {duration}</span>}
      {benefits.length > 0 && (
        <ul className='mt-4 flex flex-wrap gap-1.5'>
          {benefits.map((b, i) => (
            <li
              key={i}
              className='rounded-box bg-base-300 text-neutral px-2.5 py-0.5 text-xs font-medium'>
              {b}
            </li>
          ))}
        </ul>
      )}
      <ol className='mt-5 flex flex-col gap-2'>
        {instructions.map((inst, i) => (
          <li key={i} className='text-base-content text-sm leading-relaxed'>
            <span className='text-accent font-mono text-xs font-bold'>{i + 1}.</span> {inst}
          </li>
        ))}
      </ol>
      <Footer citation={citation} />
    </Background>
  );
};

YogaPose.displayName = 'YogaPose';
