import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const FitnessGoal: FC<TemplateProps> = ({ data }) => {
  const goal = (data.goal as string) ?? '';
  const target = (data.target as string) ?? '';
  const deadline = (data.deadline as string) ?? '';
  const plan = (data.plan as string[]) ?? [];
  const motivation = (data.motivation as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent text-xs font-bold tracking-[0.2em] uppercase'>Fitness Goal</span>
      <h1 className='text-base-content mt-2 text-4xl leading-tight font-bold'>{goal}</h1>
      <div className='mt-3 flex gap-3'>
        {target && (
          <span className='rounded-box bg-accent/10 text-accent px-3 py-1 text-xs font-bold'>
            {target}
          </span>
        )}
        {deadline && (
          <time className='rounded-box bg-base-300 text-neutral px-3 py-1 text-xs'>{deadline}</time>
        )}
      </div>
      {plan.length > 0 && (
        <ol className='mt-6 flex flex-col gap-2'>
          {plan.map((step, i) => (
            <li key={i} className='flex items-start gap-3'>
              <span className='text-accent mt-0.5 text-xs font-bold'>{i + 1}.</span>
              <p className='text-base-content text-sm'>{step}</p>
            </li>
          ))}
        </ol>
      )}
      {motivation && (
        <blockquote className='border-accent/20 mt-6 border-t pt-4'>
          <p className='text-neutral text-xs italic'>&ldquo;{motivation}&rdquo;</p>
        </blockquote>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

FitnessGoal.displayName = 'FitnessGoal';
