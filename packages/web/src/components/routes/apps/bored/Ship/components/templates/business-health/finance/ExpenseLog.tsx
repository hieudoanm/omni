import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const ExpenseLog: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const expenses = (data.expenses as { category: string; amount: string; date: string }[]) ?? [];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content mb-6 text-4xl font-bold'>{title}</h1>
      <ul className='flex flex-col gap-3'>
        {expenses.map((exp, i) => (
          <li key={i} className='border-base-300 flex items-center justify-between border-b pb-3'>
            <div className='flex items-center gap-3'>
              <span className='rounded-box bg-accent/10 text-accent px-2 py-0.5 text-xs font-bold'>
                {exp.category}
              </span>
              <time className='text-neutral text-xs'>{exp.date}</time>
            </div>
            <span className='text-base-content text-sm font-semibold'>{exp.amount}</span>
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

ExpenseLog.displayName = 'ExpenseLog';
