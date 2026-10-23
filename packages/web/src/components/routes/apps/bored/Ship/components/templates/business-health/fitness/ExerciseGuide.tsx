import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const ExerciseGuide: FC<TemplateProps> = ({ data }) => {
  const name = (data.name as string) ?? '';
  const target = (data.target as string) ?? '';
  const steps = (data.steps as string[]) ?? [];
  const tips = (data.tips as string) ?? '';
  const imageUrl = (data.imageUrl as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content text-4xl font-bold'>{name}</h1>
      {target && (
        <span className='rounded-box bg-accent/10 text-accent mt-2 inline-block self-start px-3 py-0.5 text-xs font-bold'>
          {target}
        </span>
      )}
      <ol className='mt-5 flex flex-col gap-3'>
        {steps.map((step, i) => (
          <li key={i} className='flex items-start gap-3'>
            <span className='bg-accent text-accent-content mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-xs font-bold'>
              {i + 1}
            </span>
            <p className='text-base-content text-sm'>{step}</p>
          </li>
        ))}
      </ol>
      {tips && (
        <div className='border-accent/20 mt-5 border-t pt-4'>
          <p className='text-neutral text-xs italic'>{tips}</p>
        </div>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

ExerciseGuide.displayName = 'ExerciseGuide';
