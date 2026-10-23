import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

type Meal = { day: string; breakfast: string; lunch: string; dinner: string };

export const MealPlan: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Weekly Meal Plan';
  const meals = (data.meals as Meal[]) ?? [
    {
      day: 'Mon',
      breakfast: 'Oatmeal',
      lunch: 'Grilled Chicken',
      dinner: 'Salmon',
    },
    {
      day: 'Tue',
      breakfast: 'Smoothie',
      lunch: 'Quinoa Bowl',
      dinner: 'Stir Fry',
    },
    { day: 'Wed', breakfast: 'Toast', lunch: 'Caesar Salad', dinner: 'Pasta' },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-4 text-center'>
        <span className='text-accent text-xs font-bold tracking-[0.2em] uppercase'>Meal Plan</span>
        <h1 className='text-base-content mt-1 text-4xl font-bold'>{title}</h1>
      </div>
      <div className='bg-base-200 rounded-box overflow-hidden'>
        <div className='border-base-300 flex border-b px-3 py-2'>
          <span className='text-neutral w-10 text-xs font-bold uppercase' />
          {['Breakfast', 'Lunch', 'Dinner'].map((h) => (
            <span key={h} className='text-neutral flex-1 text-center text-xs font-bold uppercase'>
              {h}
            </span>
          ))}
        </div>
        {meals.map((m, i) => (
          <div key={i} className='border-base-300 flex items-center border-b last:border-b-0'>
            <span className='text-accent w-10 text-center text-xs font-black'>{m.day}</span>
            {[m.breakfast, m.lunch, m.dinner].map((meal, j) => (
              <span
                key={j}
                className='text-base-content flex-1 px-2 py-2.5 text-center text-xs font-medium'>
                {meal}
              </span>
            ))}
          </div>
        ))}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

MealPlan.displayName = 'MealPlan';
