import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const NutritionFacts: FC<TemplateProps> = ({ data }) => {
  const item = (data.item as string) ?? '';
  const calories = (data.calories as string) ?? '';
  const fat = (data.fat as string) ?? '';
  const carbs = (data.carbs as string) ?? '';
  const protein = (data.protein as string) ?? '';
  const serving = (data.serving as string) ?? '';

  const rows = [
    { label: 'Calories', value: calories, bold: true },
    { label: 'Fat', value: fat, bold: false },
    { label: 'Carbs', value: carbs, bold: false },
    { label: 'Protein', value: protein, bold: false },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content text-4xl font-bold tracking-tight'>{item}</h1>
      {serving && <p className='text-neutral mt-1 text-xs'>Per {serving}</p>}
      <div className='border-base-300 mt-4 border-y py-1'>
        {rows.map((r) => (
          <div
            key={r.label}
            className='border-base-300 flex justify-between border-b border-dotted py-1.5 last:border-0'>
            <span className={`text-sm ${r.bold ? 'text-base-content font-bold' : 'text-neutral'}`}>
              {r.label}
            </span>
            <span
              className={`text-sm ${r.bold ? 'text-base-content font-bold' : 'text-base-content'}`}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

NutritionFacts.displayName = 'NutritionFacts';
