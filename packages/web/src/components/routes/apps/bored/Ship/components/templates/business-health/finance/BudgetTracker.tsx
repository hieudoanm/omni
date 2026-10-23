import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const BudgetTracker: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const income = (data.income as string) ?? '';
  const expenses = (data.expenses as string) ?? '';
  const savings = (data.savings as string) ?? '';
  const period = (data.period as string) ?? '';

  const incomeNum = parseFloat(income.replace(/[^0-9.]/g, '')) || 1;
  const expensesNum = parseFloat(expenses.replace(/[^0-9.]/g, '')) || 0;
  const savingsNum = parseFloat(savings.replace(/[^0-9.]/g, '')) || 0;
  const total = incomeNum + expensesNum + savingsNum || 1;

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex items-center justify-between'>
        <h1 className='text-base-content text-4xl font-bold'>{title}</h1>
        {period && <time className='text-neutral text-xs font-medium'>{period}</time>}
      </div>
      <ul className='mt-6 flex flex-col gap-4'>
        {[
          { label: 'Income', value: income, color: 'bg-accent' },
          { label: 'Expenses', value: expenses, color: 'bg-base-300' },
          { label: 'Savings', value: savings, color: 'bg-accent/40' },
        ].map((item) => {
          const val = parseFloat(item.value.replace(/[^0-9.]/g, '')) || 0;
          return (
            <li key={item.label}>
              <div className='mb-1 flex justify-between'>
                <span className='text-neutral text-xs'>{item.label}</span>
                <span className='text-base-content text-xs font-semibold'>{item.value}</span>
              </div>
              <div className='bg-base-300 h-2 w-full overflow-hidden rounded-full'>
                <div
                  className={`h-full rounded-full transition-all ${item.color}`}
                  style={{ width: `${(val / incomeNum) * 100}%` }}
                />
                <Footer citation={citation} />
              </div>
            </li>
          );
        })}
      </ul>
    </Background>
  );
};

BudgetTracker.displayName = 'BudgetTracker';
