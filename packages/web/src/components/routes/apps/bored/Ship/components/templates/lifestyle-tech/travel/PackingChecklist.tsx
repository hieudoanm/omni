import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const PackingChecklist: FC<TemplateProps> = ({ data }) => {
  const destination = (data.destination as string) ?? 'Tokyo';
  const days = (data.days as string) ?? '7 days';
  const categories = (data.categories as {
    name: string;
    items: string[];
  }[]) ?? [
    { name: 'Clothes', items: ['T-shirts x5', 'Jeans x2', 'Jacket'] },
    { name: 'Electronics', items: ['Phone charger', 'Adapter', 'Camera'] },
    { name: 'Documents', items: ['Passport', 'Tickets', 'Insurance'] },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-5 text-center'>
        <span className='text-accent text-xs font-bold tracking-[0.2em] uppercase'>
          Packing Checklist
        </span>
        <h1 className='text-base-content mt-1 text-lg font-bold'>{destination}</h1>
        <span className='text-neutral text-xs'>{days}</span>
      </div>

      <div className='flex flex-1 gap-4'>
        {categories.map((cat, i) => (
          <div key={i} className='bg-base-200 rounded-box flex-1 p-4'>
            <span className='text-accent text-xs font-bold uppercase'>{cat.name}</span>
            <ul className='mt-2 flex flex-col gap-2'>
              {cat.items.map((item, j) => (
                <li key={j} className='flex items-center gap-2'>
                  <span className='bg-accent/20 text-accent flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-sm text-xs font-bold'>
                    ✓
                  </span>
                  <span className='text-base-content text-xs'>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

PackingChecklist.displayName = 'PackingChecklist';
