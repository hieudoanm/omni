import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Step {
  step: string;
  description: string;
}

export const TechniqueTutorial: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Technique Tutorial';
  const technique = (data.technique as string) ?? '';
  const difficulty = (data.difficulty as string) ?? 'Beginner';
  const steps = (data.steps as Step[]) ?? [
    { step: 'Prep', description: 'Set up your materials' },
    { step: 'Base', description: 'Apply the first layer' },
    { step: 'Detail', description: 'Add fine details' },
  ];
  const tip = (data.tip as string) ?? '';

  const badgeColor =
    difficulty === 'Advanced'
      ? 'bg-error/20 text-error'
      : difficulty === 'Intermediate'
        ? 'bg-warning/20 text-warning'
        : 'bg-success/20 text-success';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content mb-0.5 text-4xl font-black tracking-tight'>{title}</h1>
      {technique && <p className='text-primary mb-1.5 text-xs font-semibold'>{technique}</p>}
      <span
        className={`mb-3 inline-block rounded-full px-2 py-1 text-xs font-bold tracking-wider uppercase ${badgeColor}`}>
        {difficulty}
      </span>
      <ol className='mb-3 flex w-full flex-col gap-2'>
        {steps.map((s, i) => (
          <li key={i} className='bg-base-200 flex items-start gap-2 rounded-lg p-2 text-left'>
            <span className='bg-primary text-primary-content flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold'>
              {i + 1}
            </span>
            <div>
              <h3 className='text-base-content text-xs font-bold'>{s.step}</h3>
              <p className='text-neutral text-xs leading-snug'>{s.description}</p>
            </div>
          </li>
        ))}
      </ol>
      {tip && (
        <div className='bg-accent/10 text-accent rounded-lg px-2 py-1 text-xs font-medium'>
          {tip}
        </div>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

TechniqueTutorial.displayName = 'TechniqueTutorial';
