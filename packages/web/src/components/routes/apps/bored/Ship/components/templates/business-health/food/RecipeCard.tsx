import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const RecipeCard: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const prepTime = (data.prepTime as string) ?? '';
  const cookTime = (data.cookTime as string) ?? '';
  const ingredients = (data.ingredients as string[]) ?? [];
  const steps = (data.steps as string[]) ?? [];
  const imageUrl = (data.imageUrl as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content text-4xl font-bold'>{title}</h1>
      <div className='mt-2 flex gap-2'>
        {prepTime && (
          <span className='rounded-box bg-accent/10 text-accent px-2.5 py-0.5 text-xs font-bold'>
            Prep <time>{prepTime}</time>
          </span>
        )}
        {cookTime && (
          <span className='rounded-box bg-base-300 text-neutral px-2.5 py-0.5 text-xs font-bold'>
            Cook <time>{cookTime}</time>
          </span>
        )}
      </div>
      {ingredients.length > 0 && (
        <div className='mt-4'>
          <span className='text-neutral text-xs font-bold tracking-widest uppercase'>
            Ingredients
          </span>
          <ul className='mt-1 flex flex-wrap gap-x-3 gap-y-1'>
            {ingredients.map((ing, i) => (
              <li key={i} className='text-base-content text-xs'>
                • {ing}
              </li>
            ))}
          </ul>
        </div>
      )}
      {steps.length > 0 && (
        <ol className='mt-4 flex flex-col gap-2'>
          {steps.map((step, i) => (
            <li key={i} className='text-base-content text-xs leading-relaxed'>
              <span className='text-accent font-bold'>{i + 1}.</span> {step}
            </li>
          ))}
        </ol>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

RecipeCard.displayName = 'RecipeCard';
