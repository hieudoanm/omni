import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface StepDef {
  label: string;
}

export const StepByStep: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const text = (data.text as string) ?? '';
  const steps = (data.steps as StepDef[]) ?? [];
  const items =
    steps.length > 0 ? steps : [{ label: 'Discover' }, { label: 'Learn' }, { label: 'Apply' }];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content mb-2 text-center text-4xl font-bold tracking-tight'>
        {title}
      </h1>
      <p className='text-neutral mb-4 text-center text-xs'>{text}</p>
      <ol className='flex flex-1 items-center justify-center gap-2'>
        {items.map((step, i) => (
          <li key={i} className='flex flex-1 flex-col items-center gap-1'>
            <div className='rounded-box bg-accent/10 flex h-8 w-8 items-center justify-center'>
              <span className='text-primary text-sm font-bold'>{i + 1}</span>
            </div>
            <span className='text-neutral text-center text-xs font-semibold tracking-wide uppercase'>
              {step.label}
            </span>
          </li>
        ))}
      </ol>
      <Footer citation={citation} />
    </Background>
  );
};

StepByStep.displayName = 'StepByStep';
