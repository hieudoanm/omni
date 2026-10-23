import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const FinancialPlan: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const steps = (data.steps as { label: string; desc: string }[]) ?? [];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content mb-8 text-4xl font-bold'>{title}</h1>
      <ol className='flex flex-col gap-5'>
        {steps.map((step, i) => (
          <li key={i} className='flex items-start gap-4'>
            <span className='bg-accent text-accent-content mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold'>
              {i + 1}
            </span>
            <div>
              <p className='text-base-content text-sm font-semibold'>{step.label}</p>
              <p className='text-neutral mt-0.5 text-xs'>{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
      <Footer citation={citation} />
    </Background>
  );
};

FinancialPlan.displayName = 'FinancialPlan';
